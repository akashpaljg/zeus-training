using System;
using System.Collections.Generic;
using System.Diagnostics;
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
        ConnectionFactory factory { get; set; }
        IConnection connection { get; set; }
        IModel channel { get; set; }
        private RabbitDbProducer _rabbitdbproducer;
       

        private int BatchSize = 0;

        public RabbitListener(string _hostName)
        {
            factory = new ConnectionFactory() { HostName = _hostName };
            try
            {
                connection = factory.CreateConnection();
                channel = connection.CreateModel();
                _rabbitdbproducer = new RabbitDbProducer("localhost");
                
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error establishing connection: {e.Message}");
            }
        }

        public void Register()
        {
            
            Console.WriteLine("I'm registering");
            channel.QueueDeclare(queue: "wello", durable: false, exclusive: false, autoDelete: false, arguments: null);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                Console.WriteLine("Message received");
                await ProcessStreamMessage(message);
                channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);
                channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
            };

            channel.BasicConsume(queue: "wello", autoAck: false, consumer: consumer);
        }

        public async Task ProcessStreamMessage(string message)
        {
            StringReader reader = new StringReader(message);
            string line;
            var models = new List<CsvModel>();

            while ((line = reader.ReadLine()) != null)
            {
                try
                {
                    CsvModel? modelData = line.ToCsvData();
                    models.Add(modelData);
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Error parsing CSV data: {e.Message}");
                }
            }

            // BatchSize = models.Count > 100 ? models.Count / 100 : models.Count;
            BatchSize = 1000;

            
            await BulkToMySQLAsync(models);
            
            
        }

        async Task BulkToMySQLAsync(List<CsvModel> models)
        {
            StringBuilder sCommand = new StringBuilder("REPLACE INTO csvdata (Id,EmailId,Name,Country,State,City,TelephoneNumber,AddressLine1,AddressLine2,DateOfBirth,FY2019_20,FY2020_21,FY2021_22,FY2022_23,FY2023_24) VALUES ");
            String sCommand2 = sCommand.ToString();
            using (MySqlConnection mConnection = new MySqlConnection("server=localhost;port=3306;database=csvhandle;user=root;password=password;AllowUserVariables=true"))
            {
                List<string> Rows = new List<string>();
                for (int i = 0; i < models.Count; i++)
                {
                    Rows.Add(string.Format("('{0}','{1}','{2}','{3}','{4}','{5}','{6}','{7}','{8}','{9}','{10}','{11}','{12}','{13}','{14}')",
                        models[i].Id,
                        MySqlHelper.EscapeString(models[i].EmailId),
                        MySqlHelper.EscapeString(models[i].Name),
                        MySqlHelper.EscapeString(models[i].Country),
                        MySqlHelper.EscapeString(models[i].State),
                        MySqlHelper.EscapeString(models[i].City),
                        MySqlHelper.EscapeString(models[i].TelephoneNumber),
                        MySqlHelper.EscapeString(models[i].AddressLine1),
                        MySqlHelper.EscapeString(models[i].AddressLine2),
                        models[i].DateOfBirth.ToString("yyyy-MM-dd"),
                        models[i].FY2019_20,
                        models[i].FY2020_21,
                        models[i].FY2021_22,
                        models[i].FY2022_23,
                        models[i].FY2023_24
                    ));
                }
                


                for (int i = 0; i < Rows.Count; i += BatchSize)
                {
                    if(Rows.Count-i >= BatchSize){
                        sCommand.Append(string.Join(",",Rows.Skip(i).Take(BatchSize) ));
                    }else{
                        BatchSize = Rows.Count-i;
                        sCommand.Append(string.Join(",",Rows.Skip(i).Take(BatchSize) ));
                    }
                    sCommand.Append(';');
                    Console.Write($"Batch {i+1}");
                    
                    // using (MySqlCommand myCmd = new MySqlCommand(sCommand.ToString(), mConnection))
                    // {
                    //     myCmd.Transaction = transactions; // DAP error resolved
                    //     myCmd.CommandType = System.Data.CommandType.Text;
                    //     try
                    //     {
                    //         await myCmd.ExecuteNonQueryAsync();
                    //         sCommand = new StringBuilder(sCommand2);
                    //     }
                    //     catch (Exception e)
                    //     {
                    //         Console.WriteLine($"Error executing SQL command: {e.Message}");
                    //         await transactions.RollbackAsync();
                           
                    //     }
                    // }
                    
                    await _rabbitdbproducer.Register("server=localhost;port=3306;database=csvhandle;user=root;password=password;AllowUserVariables=true",sCommand);
                    sCommand = new StringBuilder(sCommand2);
                    
                }
            }
        } 
    }
}
