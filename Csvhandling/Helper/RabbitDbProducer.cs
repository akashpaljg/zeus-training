using System;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Csvhandling.Models;
using RabbitMQ.Client;

namespace Csvhandling.Helper
{
    public class RabbitDbProducer
    {
        ConnectionFactory factory { get; set; }
        IConnection connection { get; set; }
        IModel channel { get; set; }

        public RabbitDbProducer(string _hostName)
        {
            factory = new ConnectionFactory { HostName = _hostName };
            try
            {
                connection = factory.CreateConnection();
                channel = connection.CreateModel();
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error establishing connection: {e.Message}");
            }
        }

        public async Task Register(List<CsvModel> models)
        {
            Console.WriteLine("I'm registering RabbitDbProducer");

            channel.QueueDeclare(queue: "welloDb", durable: false, exclusive: false, autoDelete: false, arguments: null);

            var jsonString = JsonSerializer.Serialize(models);
            var body = Encoding.UTF8.GetBytes(jsonString);

            Console.WriteLine("Encoded data in queue: RabbitDbProducer");


            channel.BasicPublish(exchange: string.Empty,
                                 routingKey: "welloDb",
                                 basicProperties: null,
                                 body: body);

            Console.WriteLine(" [x] Sent Command");

            // Optionally, you can wait for an acknowledgment here using the correlationId and reply queue.
        }

        public void Deregister()
        {
            connection.Close();
        }
    }

    public class ConnectionMessage
    {
        public string Command { get; set; }
        public string ConnectionString { get; set; }

        public ConnectionMessage(string connectionString, string command)
        {
            Command = command;
            ConnectionString = connectionString;
        }
    }
}
