using System.Text;
using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using Polly;
using Polly.Contrib.WaitAndRetry;
using Polly.Retry;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Listener.Models;
using Listener.Helper;
using Listener.Mappers;
using Listener.Service;
using System.Data;


public class RabbitListener
{
    private static readonly AsyncRetryPolicy _retryPolicy;
    private static ILogger<RabbitListener> _logger;

    private static StatusService _statusService;
    static RabbitListener()
    {
        var _loggerFactory = LoggerFactory.Create(builder =>
        {
            builder
                .AddConsole()
                .AddDebug()
                .SetMinimumLevel(LogLevel.Debug);
        });

        _logger = _loggerFactory.CreateLogger<RabbitListener>();

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

        Console.WriteLine("Started...");

        await _retryPolicy.ExecuteAsync(async ()=>{

        channel.QueueDeclare(queue: "wello2", durable: false, exclusive: false, autoDelete: false, arguments: null);

        var consumer = new EventingBasicConsumer(channel);
        channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

        consumer.Received += async (model, ea) =>
        {
            var body = ea.Body.ToArray();
            var message = Encoding.UTF8.GetString(body);

            Console.WriteLine($"Message received: {message}");

            try
            {
                var msgParts = message.Split("|");
                string filePath = msgParts[0];
                string uid = msgParts[1];
                string fid = msgParts[2];
                await _statusService.UpdateStatus(uid,fid,"Processing");
                await ProcessStreamMessage(filePath, uid, fid);
            }
            catch (Exception e)
            {
                _logger.LogError($"Error processing message: {e.Message}");
            }

            // Acknowledge the message
            channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
        };
        

        channel.BasicConsume(queue: "wello2", autoAck: false, consumer: consumer);
  });
        Console.WriteLine("Press [Enter] to exit");
        Console.ReadLine();
    }

    private static async Task ProcessStreamMessage(string filePath, string uid,string fid)
    {
        List<CsvModel> models = new List<CsvModel>();

        try
        {
            using (var stream = await _retryPolicy.ExecuteAsync(async () =>
            {
                return new FileStream(filePath, FileMode.Open, FileAccess.Read);
            }))
            using (var reader = new StreamReader(stream))
            {
                await reader.ReadLineAsync(); // Read header line

                string line;
                while ((line = await reader.ReadLineAsync()) != null)
                {
                    try
                    {
                        var modelData = line.ToCsvData();
                        models.Add(modelData);
                    }
                    catch (Exception e)
                    {
                        _logger.LogError($"Error parsing CSV data: {e.Message}");
                    }
                }
            }
        }
        catch (Exception e)
        {
            _logger.LogError($"Error processing file: {e.Message}");
        }
        finally
        {
            if (File.Exists(filePath))
            {
                try
                {
                    await _retryPolicy.ExecuteAsync(async () =>
                    {
                        File.Delete(filePath);
                        await Task.CompletedTask;
                    });
                }
                catch (Exception e)
                {
                    _logger.LogError($"Error deleting file: {e.Message}");
                }
            }
        }

        int totalBatches = (int)Math.Ceiling(models.Count / 10000.0);
        Console.WriteLine(totalBatches);
        await _statusService.UpdateTotalBatches(uid,fid,totalBatches);
         await _statusService.UpdateStatus(uid,fid,"Batching");
        await BulkToMySQLAsync(models, uid,fid);
    }

    private static int Mini(int a, int b){
        if(a<b){
            return a;
        }
        return b;
    }

    private static async Task BulkToMySQLAsync(List<CsvModel> models, string uid,string fid)
    {
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

        RabbitProducer _producer = new RabbitProducer();
        int batchSize = 10000;
        await _statusService.UpdateStatus(uid,fid,"Uplaoding");
       

        for (int i = 0; i < rows.Count; i += batchSize)
        {
             Batch newBatch = new Batch{
                BId = Guid.NewGuid().ToString(),
                BatchStart = i+1,
                BatchEnd = Mini(i+batchSize,rows.Count),
                BatchStatus = "Pending"
             };

             
            Console.WriteLine($"Batch {i / batchSize + 1}");

            await _retryPolicy.ExecuteAsync(async () =>
            {
                
                await _producer.Register(models.Skip(i).Take(batchSize).ToList(),uid,fid,newBatch.BId);
                 await _statusService.AddBatch(uid,fid,newBatch);
            });
        }
    }
}
