﻿using System;
using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using MySql.Data.MySqlClient;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using DbListener.Models;



var factory = new ConnectionFactory() { HostName = "localhost" };
var connection = factory.CreateConnection();
var channel = connection.CreateModel();

Console.WriteLine("Db listener Started...");
channel.QueueDeclare(queue: "welloDb1", durable: false, exclusive: false, autoDelete: false, arguments: null);

var consumer = new EventingBasicConsumer(channel);
channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);
consumer.Received += async (model, ea) =>
{
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);

    List<CsvModel> lists = JsonSerializer.Deserialize<List<CsvModel>>(message);

    if(lists.Count != 0){
        Stopwatch st = new Stopwatch();
                    st.Start();
                    await Process(lists);
                    Console.WriteLine($"Processing time: {st.Elapsed}");
                    st.Stop();
    }

channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
};
 channel.BasicConsume(queue: "welloDb1", autoAck: false, consumer: consumer);

 Console.WriteLine("Press [Enter] to exit");
Console.ReadLine();

 async Task Process(List<CsvModel> models){
    try
            {

            var sCommand = new StringBuilder("REPLACE INTO csvdata (Id,EmailId,Name,Country,State,City,TelephoneNumber,AddressLine1,AddressLine2,DateOfBirth,FY2019_20,FY2020_21,FY2021_22,FY2022_23,FY2023_24) VALUES ");

            using var mConnection = new MySqlConnection("server=localhost;port=3306;database=csvhandle;user=root;password=password;AllowUserVariables=true");

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

                // using (var mConnection = new MySqlConnection("server=localhost;port=3306;database=csvhandle;user=root;password=password;AllowUserVariables=true")
                // {

                    sCommand.Append(string.Join(",", rows));
                    await mConnection.OpenAsync();
                    using var transactions = await mConnection.BeginTransactionAsync();

                    using (var myCmd = new MySqlCommand(sCommand.ToString(), mConnection))
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
                // }
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error with database connection: {e.Message}");
            }
        
}