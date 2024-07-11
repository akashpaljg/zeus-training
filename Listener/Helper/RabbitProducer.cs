using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RabbitMQ.Client;
using Listener.Models;
using System.Text.Json;
using System.Text;
using log4net;

namespace Listener.Helper
{
    public class RabbitProducer
    {
        private static readonly ILog log = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        ConnectionFactory factory { get; set; }
        IConnection connection { get; set; }
        IModel channel { get; set; }

        public RabbitProducer()
        {
            log.Info("RabbitProducer Started...");
            factory = new ConnectionFactory { HostName = "localhost" };
            try
            {
                connection = factory.CreateConnection();
                channel = connection.CreateModel();
            }
            catch (Exception e)
            {
                log.Error($"Error establishing connection: {e.Message}");
            }
        }

        public async Task Register(List<CsvModel> models, string uid, string fid, string bid)
        {
            log.Info("Registered RabbitDbProducer");

            channel.QueueDeclare(queue: "welloDb2", durable: false, exclusive: false, autoDelete: false, arguments: null);

            var jsonString = JsonSerializer.Serialize(models);
            var body = Encoding.UTF8.GetBytes($"{jsonString}|{uid}|{fid}|{bid}");

            log.Info($"Encoded data in queue");

            channel.BasicPublish(exchange: string.Empty,
                                 routingKey: "welloDb2",
                                 basicProperties: null,
                                 body: body);

            log.Info(" [x] Sent Command");

            // Optionally, you can wait for an acknowledgment here using the correlationId and reply queue.
        }

        public void Deregister()
        {
            connection.Close();
        }
    }
}
