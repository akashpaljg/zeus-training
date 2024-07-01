using System;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Csvhandling.Models;
using RabbitMQ.Client;

namespace Csvhandling.Helper
{

    public class BatchWithid{
        public List<CsvModel> lists { get; set; }
        public int BatchId {get;set;}
        public int StatusId {get;set;}

        public BatchWithid()
        {
            lists = new List<CsvModel>();
        }
        
    }
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

        public async Task Register(List<CsvModel> models,int BId,int Id)
        {
            Console.WriteLine("I'm registering RabbitDbProducer");

            channel.QueueDeclare(queue: "welloDb1", durable: false, exclusive: false, autoDelete: false, arguments: null);
            BatchWithid B_U_Id = new BatchWithid(){
                BatchId = BId,
                lists = models,
                StatusId = Id
            };
            
            var jsonString = JsonSerializer.Serialize(B_U_Id);
            var body = Encoding.UTF8.GetBytes(jsonString);

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
