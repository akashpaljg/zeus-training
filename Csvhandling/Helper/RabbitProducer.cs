using System;
using System.Text;
using System.Threading.Tasks;
using RabbitMQ.Client;

namespace Csvhandling.Helper
{
    public class RabbitProducer
    {
        private readonly ConnectionFactory _factory;
        private readonly IConnection _connection;
        private readonly IModel _channel;

        public RabbitProducer(string hostName)
        {
            _factory = new ConnectionFactory { HostName = hostName };
            try
            {
                _connection = _factory.CreateConnection();
                _channel = _connection.CreateModel();
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error establishing connection: {e.Message}");
            }
        }

        public async Task Register(string filePath, int id)
        {
            Console.WriteLine($"I'm registering RabbitProducer Id: {id}");

            _channel.QueueDeclare(queue: "wello2", durable: false, exclusive: false, autoDelete: false, arguments: null);

            var body = Encoding.UTF8.GetBytes($"{filePath}|{id}");

            Console.WriteLine("Encoded data in queue: Producer");

            _channel.BasicPublish(exchange: string.Empty,
                                  routingKey: "wello2",
                                  basicProperties: null,
                                  body: body);

            Console.WriteLine(" [x] Sent File");
        }

        public void Deregister()
        {
            _connection.Close();
        }
    }
}
