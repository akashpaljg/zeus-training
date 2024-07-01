using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookStoreApi.Services;
using Csvhandling.Mappers;
using Csvhandling.Models;
using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Csvhandling.Helper
{
    public class RabbitListener
    {
        private readonly ConnectionFactory _factory;
        private IConnection _connection;
        private IModel _channel;
        private readonly RabbitDbProducer _rabbitDbProducer;
        private const int BatchSize = 10000;

        private readonly StatusService _statusService;
        private readonly ILogger<RabbitListener> _logger;

        public RabbitListener(string hostName, StatusService service, ILogger<RabbitListener> logger)
        {
            _factory = new ConnectionFactory() { HostName = hostName };
            try
            {
                _connection = _factory.CreateConnection();
                _channel = _connection.CreateModel();
                _rabbitDbProducer = new RabbitDbProducer(hostName);
                _statusService = service;
                _logger = logger;
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error establishing connection: {e.Message}");
            }
        }

        public void Register()
        {
            Console.WriteLine("I'm registering");
            _channel.QueueDeclare(queue: "wello2", durable: false, exclusive: false, autoDelete: false, arguments: null);

            var consumer = new EventingBasicConsumer(_channel);
            _channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);
        
            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                Console.WriteLine($"Message received {message}");

                

                try
                {
                    var msgParts = message.Split('|');
                    Console.WriteLine(msgParts);
                    if (msgParts.Length != 2)

                    {
                        throw new FormatException("Message format is incorrect.");
                    }

                    string filePath = msgParts[0];
                    int id = int.Parse(msgParts[1]);
                    // if (!int.TryParse(msgParts[1], out int id))
                    // {
                    //     throw new FormatException("Message ID is not a valid integer.");
                    // }

                    await _statusService.ProcessingUploadingStatus(id, "Processing");
                    await ProcessStreamMessage(filePath, id);

                    _channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error processing message: {ex.Message}");
                    _channel.BasicNack(deliveryTag: ea.DeliveryTag, multiple: false, requeue: true);
                }
            };

            _channel.BasicConsume(queue: "wello2", autoAck: false, consumer: consumer);
        }

        public async Task ProcessStreamMessage(string filePath, int id)
        {
            List<CsvModel> models = new List<CsvModel>();

            try
            {
                using var stream = new FileStream(filePath, FileMode.Open);
                using var reader = new StreamReader(stream);
                await reader.ReadLineAsync(); // Skip header

                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    try
                    {
                        var modelData = line.ToCsvData();
                        models.Add(modelData);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine($"Error parsing CSV data: {e.Message}");
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error processing file: {e.Message}");
            }
            finally
            {
                if (File.Exists(filePath))
                {
                    try
                    {
                        Console.WriteLine($"File Deleted {filePath}");
                        File.Delete(filePath);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine($"Error deleting file: {e.Message}");
                    }
                }
            }
                     int totalBatches = (int)Math.Ceiling(models.Count / (double)BatchSize);
                     _logger.LogWarning($"BatchSize : {totalBatches}");
            await _statusService.UpdateStatus(totalBatches,"Uploading", id);
            await BulkToMySQLAsync(models,id);
        }

        private async Task BulkToMySQLAsync(List<CsvModel> models,int id)
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
            int c = 1;
            for (int i = 0; i < rows.Count; i += BatchSize)
            {
                Batch batch = new Batch(){
                    BId = c,
                    BatchStatus = "Queuing",
                    BatchStart = i,
                    BatchEnd = i+BatchSize
                };
                await _statusService.UpdateStatus(batch,"Batching",id);
                // await _rabbitDbProducer.Register(models.Skip(i).Take(BatchSize).ToList(),c,id);
            }

            
        }
    }
}
