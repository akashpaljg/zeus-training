using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
      private static readonly log4net.ILog log = log4net.LogManager.GetLogger
    (System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

    private static readonly AsyncRetryPolicy _retryPolicy;
      private static StatusService _statusService;

    static RabbitListener()
    {
        
        var delay = Backoff.DecorrelatedJitterBackoffV2(TimeSpan.FromSeconds(1), retryCount: 5);
        _retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(delay, (exception, timeSpan, retryCount, context) =>
            {
                log.Error($"Retry {retryCount} encountered an error: {exception.Message}. Waiting {timeSpan} before next retry.");
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

        log.Info("Started Listening");

        await _retryPolicy.ExecuteAsync(async () =>
        {
            channel.QueueDeclare(queue: "wello2", durable: false, exclusive: false, autoDelete: false, arguments: null);

            var consumer = new EventingBasicConsumer(channel);
            channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);

                log.Info($"Message received: {message}");

                try
                {
                    var msgParts = message.Split("|");
                    string filePath = msgParts[0];
                    string uid = msgParts[1];
                    string fid = msgParts[2];
                    await _statusService.UpdateStatus(uid, fid, "Processing");
                    await ProcessStreamMessage(filePath, uid, fid);
                }
                catch (Exception e)
                {
                    log.Error($"Error processing message: {e.Message}");
                }

                // Acknowledge the message
                channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
            };

            channel.BasicConsume(queue: "wello2", autoAck: false, consumer: consumer);
        });

        Console.WriteLine("Press [Enter] to exit");
        Console.ReadLine();
    }

    private static async Task ProcessStreamMessage(string filePath, string uid, string fid)
    {
        log.Info("Started Processing: ProcessStreamMessage Method");
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
                        log.Error($"Error parsing CSV data: {e.Message}");
                    }
                }
            }
        }
        catch (Exception e)
        {
            log.Error($"Error processing file: {e.Message}");
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
                        log.Warn($"File Deleted from {filePath}");
                    });
                }
                catch (Exception e)
                {
                    log.Error($"Error deleting file: {e.Message}");
                }
            }
        }

        int totalBatches = (int)Math.Ceiling(models.Count / 10000.0);
        await _statusService.UpdateTotalBatches(uid, fid, totalBatches);
        await _statusService.UpdateStatus(uid, fid, "Batching");
        await BulkToMySQLAsync(models, uid, fid);
    }

    private static int Mini(int a, int b) => a < b ? a : b;

    private static async Task BulkToMySQLAsync(List<CsvModel> models, string uid, string fid)
    {
        log.Info("Started batching: Method BulkToMySQLAsync");
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
        await _statusService.UpdateStatus(uid, fid, "Uploading");

        for (int i = 0; i < rows.Count; i += batchSize)
        {
            Batch newBatch = new Batch
            {
                BId = Guid.NewGuid().ToString(),
                BatchStart = i + 1,
                BatchEnd = Mini(i + batchSize, rows.Count),
                BatchStatus = "Pending"
            };

            log.Info($"Batch {i / batchSize + 1} Processed");

            await _retryPolicy.ExecuteAsync(async () =>
            {
                await _producer.Register(models.Skip(i).Take(batchSize).ToList(), uid, fid, newBatch.BId);
                await _statusService.AddBatch(uid, fid, newBatch);
            });
        }
    }
}
