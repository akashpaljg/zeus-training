using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Listener.Models;
using Listener.Mappers;
using System.Text.Json;
using System.Text;
using MySql.Data.MySqlClient;

namespace Listener.Helper
{
    public class RabbitProducer
    {
        ConnectionFactory factory { get; set; }
        IConnection connection { get; set; }
        IModel channel { get; set; }

        public RabbitProducer()
        {
            Console.WriteLine("RabbitProducer Started...");
            factory = new ConnectionFactory { HostName = "localhost" };
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

        public async Task Register(List<CsvModel> models,string uid,string fid,string bid)
        {
            Console.WriteLine("I'm registering RabbitDbProducer");

            channel.QueueDeclare(queue: "welloDb1", durable: false, exclusive: false, autoDelete: false, arguments: null);
   
            
            var jsonString = JsonSerializer.Serialize(models);
            var body = Encoding.UTF8.GetBytes($"{jsonString}|{uid}|{fid}|{bid}");

            Console.WriteLine("Encoded data in queue: RabbitDbProducer");


            channel.BasicPublish(exchange: string.Empty,
                                 routingKey: "welloDb1",
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
}