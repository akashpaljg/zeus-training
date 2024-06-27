using System;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using MySql.Data.MySqlClient;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Csvhandling.Helper
{
    public class RabbitDbListener
    {
        ConnectionFactory factory { get; set; }
        IConnection connection { get; set; }
        IModel channel { get; set; }

        public RabbitDbListener(string _hostName)
        {
            factory = new ConnectionFactory() { HostName = _hostName };
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

        public void Register()
        {
            Console.WriteLine("I'm registering Db listener");
            channel.QueueDeclare(queue: "welloDb", durable: false, exclusive: false, autoDelete: false, arguments: null);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                ConnectionMessage? connectionMessage = JsonSerializer.Deserialize<ConnectionMessage>(message);
                // Console.WriteLine($"Message received: Command={connectionMessage?.Command}, ConnectionString={connectionMessage?.ConnectionString}");

                if (connectionMessage != null)
                {
                    Stopwatch st = new Stopwatch();
                    st.Start();
                    await Process(connectionMessage.Command, connectionMessage.ConnectionString);
                    Console.WriteLine($"Processing time: {st.Elapsed}");
                }
                

                channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);

                // Optionally, send an acknowledgment message back to the producer here.
            };

            channel.BasicConsume(queue: "welloDb", autoAck: false, consumer: consumer);
        }

        public async Task Process(string sCommand, string connectionString)
        {
            try
            {
                using (var mConnection = new MySqlConnection(connectionString))
                {
                    await mConnection.OpenAsync();
                    using var transactions = await mConnection.BeginTransactionAsync();

                    using (var myCmd = new MySqlCommand(sCommand, mConnection))
                    {
                        myCmd.CommandType = System.Data.CommandType.Text;
                        try
                        {
                              myCmd.Transaction = transactions;
                            await myCmd.ExecuteNonQueryAsync();
                            Console.WriteLine("Command executed successfully.");
                            await transactions.CommitAsync();
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine($"Error executing SQL command: {e.Message}");
                            await transactions.RollbackAsync();
                        }
                    }
                    await mConnection.CloseAsync();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error with database connection: {e.Message}");
            }
        }
    }
}
