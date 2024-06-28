using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csvhandling.Mappers;
using Csvhandling.Models;
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

        public RabbitListener(string hostName)
        {
            _factory = new ConnectionFactory() { HostName = hostName };
            try
            {
                _connection = _factory.CreateConnection();
                _channel = _connection.CreateModel();
                _rabbitDbProducer = new RabbitDbProducer(hostName);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error establishing connection: {e.Message}");
            }
        }

        public void Register()
        {
            Console.WriteLine("I'm registering");
            _channel.QueueDeclare(queue: "wello", durable: false, exclusive: false, autoDelete: false, arguments: null);

            var consumer = new EventingBasicConsumer(_channel);
            _channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);
            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                Console.WriteLine("Message received");
                await ProcessStreamMessage(message);
            
                _channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
            };

            _channel.BasicConsume(queue: "wello", autoAck: false, consumer: consumer);
        }

        public async Task ProcessStreamMessage(string filePath)
        {
            List<CsvModel> models = new List<CsvModel>();

            try
            {
                using var stream = new FileStream(filePath, FileMode.Open);
                using var reader = new StreamReader(stream);
                string line;
                await reader.ReadLineAsync(); // Skip header

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
                // Ensure the file stream is closed before attempting to delete the file
                if (File.Exists(filePath))
                {
                    try
                    {
                        Console.WriteLine("========");
                        Console.WriteLine($"File Deleted {filePath}");
                        Console.WriteLine("========");
                        File.Delete(filePath);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine($"Error deleting file: {e.Message}");
                    }
                }
            }

            await BulkToMySQLAsync(models);
        }

        private async Task BulkToMySQLAsync(List<CsvModel> models)
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

            for (int i = 0; i < rows.Count; i += BatchSize)
            {

                // await _rabbitDbProducer.Register("server=localhost;port=3306;database=csvhandle;user=root;password=password;AllowUserVariables=true", sCommand);
                await _rabbitDbProducer.Register(models.Skip(i).Take(BatchSize).ToList());
            }
        }
    }
}
