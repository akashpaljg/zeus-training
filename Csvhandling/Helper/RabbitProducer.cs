using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using RabbitMQ.Client;

namespace Csvhandling.Helper
{
    public class RabbitProducer
    {
        ConnectionFactory factory { get; set; }
        IConnection connection { get; set; }
        IModel channel { get; set; }

        public RabbitProducer(string _hostName)
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

        public async Task Register(string filePath)
        {
            Console.WriteLine("I'm registering RabbitProducer");

            channel.QueueDeclare(queue: "wello", durable: false, exclusive: false, autoDelete: false, arguments: null);

            // using var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8);
            // Console.WriteLine("Initialized Stream: Producer");
            // await reader.ReadLineAsync();

            var body = Encoding.UTF8.GetBytes(filePath);

            Console.WriteLine("Encoded data in queue: Producer");

            channel.BasicPublish(exchange: string.Empty,
                                 routingKey: "wello",
                                 basicProperties: null,
                                 body: body);

            Console.WriteLine(" [x] Sent File");
        }

        public void Deregister()
        {
            connection.Close();
        }
    }
}
