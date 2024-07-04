using System;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using MySql.Data.MySqlClient;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using DbListener.Models;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Contrib.WaitAndRetry;
using Polly.Retry;
using DbListener.Service;


public class RabbitDbListener
    {
        private static readonly AsyncRetryPolicy _retryPolicy;
        private static readonly ILogger<RabbitDbListener> _logger;

        private static StatusService _statusService;

        static RabbitDbListener()
        {
            var loggerFactory = LoggerFactory.Create(builder =>
            {
                builder
                    .AddConsole()
                    .AddDebug()
                    .SetMinimumLevel(LogLevel.Debug);
            });

            _logger = loggerFactory.CreateLogger<RabbitDbListener>();

            var delay = Backoff.DecorrelatedJitterBackoffV2(TimeSpan.FromSeconds(1), retryCount: 5);
            _retryPolicy = Policy
                .Handle<Exception>()
                .WaitAndRetryAsync(delay, (exception, timeSpan, retryCount, context) =>
                {
                    _logger.LogError($"Retry {retryCount} encountered an error: {exception.Message}. Waiting {timeSpan} before next retry.");
                });
                _statusService = new StatusService();
        }

        public static async Task Main(string[] args)
        {
            var factory = new ConnectionFactory { HostName = "localhost" };
            IConnection connection = null!;
            IModel channel = null!;

            await _retryPolicy.ExecuteAsync(async () =>
            {
                connection = factory.CreateConnection();
                channel = connection.CreateModel();
                await Task.CompletedTask;
            });

            Console.WriteLine("Db listener Started...");
            await _retryPolicy.ExecuteAsync(async ()=>{
                channel.QueueDeclare(queue: "welloDb1", durable: false, exclusive: false, autoDelete: false, arguments: null);

            var consumer = new EventingBasicConsumer(channel);
            channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);
            consumer.Received += async (model, ea) =>
            {
                byte[] body = ea.Body.ToArray();
                string message = Encoding.UTF8.GetString(body);
                string[] msgParts = message.Split("|");
                string models = msgParts[0];
                string uid = msgParts[1];
                string fid = msgParts[2];
                string bid = msgParts[3];

                try
                {
                    var lists = JsonSerializer.Deserialize<List<CsvModel>>(models);

                    if (lists.Count != 0)
                    {
                        Stopwatch st = new Stopwatch();
                        st.Start();
                        await Process(lists,uid,fid,bid);
                        Console.WriteLine($"Processing time: {st.Elapsed}");
                        st.Stop();
                    }
                }
                catch (Exception e)
                {
                    _logger.LogError($"Error processing message: {e.Message}");
                }

          
            
                channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
            };
            channel.BasicConsume(queue: "welloDb1", autoAck: false, consumer: consumer);
  });
            Console.WriteLine("Press [Enter] to exit");
            Console.ReadLine();
        }

        private static async Task Process(List<CsvModel> models,string uid,string fid,string bid)
        {
            try
            {
                var sCommand = new StringBuilder("REPLACE INTO csvdata (Id,EmailId,Name,Country,State,City,TelephoneNumber,AddressLine1,AddressLine2,DateOfBirth,FY2019_20,FY2020_21,FY2021_22,FY2022_23,FY2023_24) VALUES ");

                var rows = models.Select(model =>
                    string.Format("('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}','{9}','{10}','{11}','{12}','{13}','{14}')",
                        model.Id,
                        MySqlHelper.EscapeString(model.EmailId),
                        MySqlHelper.EscapeString(model.Name),
                        MySqlHelper.EscapeString(model.Country),
                        MySqlHelper.EscapeString(model.State),
                        MySqlHelper.EscapeString(model.City),
                        MySqlHelper.EscapeString(model.TelephoneNumber),
                        MySqlHelper.EscapeString(model.AddressLine1),
                        MySqlHelper.EscapeString(model.AddressLine2),
                        model.DateOfBirth.ToString("yyyy-MM-dd"),
                        model.FY2019_20,
                        model.FY2020_21,
                        model.FY2021_22,
                        model.FY2022_23,
                        model.FY2023_24)).ToList();

                sCommand.Append(string.Join(",", rows));

                using var mConnection = new MySqlConnection("server=localhost;port=3306;database=csvhandle;user=root;password=password;AllowUserVariables=true");
            

                await _retryPolicy.ExecuteAsync(async ()=>{

                await mConnection.OpenAsync();
                
                using var transaction = await mConnection.BeginTransactionAsync();

                using (var myCmd = new MySqlCommand(sCommand.ToString(), mConnection, transaction))
                {
                    myCmd.CommandType = System.Data.CommandType.Text;
                    try
                    {
                        await _retryPolicy.ExecuteAsync(async () =>
                        {
                            await myCmd.ExecuteNonQueryAsync();
                        });
                        Console.WriteLine("Batch Inserted successfully.");
                        await transaction.CommitAsync();
                         await _statusService.UpdateBatchCount(uid,fid);
                        await _statusService.UpdateBatchStatus(uid,fid,bid,"Completed");
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine($"Error Inserting Batch: {e.Message}");
                         await _statusService.UpdateBatchStatus(uid,fid,bid,"Error");
                        await transaction.RollbackAsync();
                    }
                }
               
                 await mConnection.CloseAsync();

                });
                
               

                await _statusService.Check(uid,fid);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error with database connection: {e.Message}");
            }
        }
    }
