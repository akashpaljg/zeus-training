using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Csvhandling.Mappers;
using Csvhandling.Models;
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
            connection = factory.CreateConnection();
            channel = connection.CreateModel();
        }

        public async Task Register(IFormFile file ){

            Console.WriteLine("I'm registering RabbitProducer");

            channel.QueueDeclare(queue: "wello", durable: false, exclusive: false, autoDelete: false, arguments: null);

        //    var stream = new MemoryStream();
        //    await file.CopyToAsync(stream);
           StreamReader reader = new(file.OpenReadStream(), Encoding.UTF8);

            Console.WriteLine("Initialized Stream: Producer");
            await reader.ReadLineAsync(); 
            
            var body = Encoding.UTF8.GetBytes(reader.ReadToEnd().ToString());

            Console.WriteLine("Encoded data in queue: Producer");

            channel.BasicPublish(exchange: string.Empty,
                     routingKey: "wello",
                     basicProperties: null,
                     body: body);

        Console.WriteLine($" [x] Sent File");

        Console.WriteLine(" Press [enter] to exit.");
        Console.ReadLine();
        }

        public void Deregister(){
            this.connection.Close();
        }
    }
}