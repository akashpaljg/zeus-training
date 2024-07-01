using System;
using System.Text;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Listener.Models;
using Listener.Mappers;
using MySql.Data.MySqlClient;
using Listener.Helper;

var factory = new ConnectionFactory { HostName = "localhost" };

RabbitProducer _producer = new RabbitProducer();

 var connection = factory.CreateConnection();
 var channel = connection.CreateModel();
Console.WriteLine("Started...");

channel.QueueDeclare(queue: "wello2", durable: false, exclusive: false, autoDelete: false, arguments: null);

var consumer = new EventingBasicConsumer(channel);
channel.BasicQos(prefetchSize: 0, prefetchCount: 1, global: false);

consumer.Received += (model, ea) =>
{
    var body = ea.Body.ToArray();
    var message = Encoding.UTF8.GetString(body);
    Console.WriteLine($"Message received: {message}");

    try{
        var msgParts = message.Split("|");
        Console.WriteLine(msgParts);
        string filePath = msgParts[0];
        int id = int.Parse(msgParts[1]);

        ProcessStreamMessage(filePath, id);
    }catch(Exception e){
        Console.WriteLine(e.Message);
    }
    // Acknowledge the message
    channel.BasicAck(deliveryTag: ea.DeliveryTag, multiple: false);
};

channel.BasicConsume(queue: "wello2", autoAck: false, consumer: consumer);


async Task ProcessStreamMessage(string filePath, int id){
    List<CsvModel> models = new List<CsvModel>();

    try{
        using var stream = new FileStream(filePath,FileMode.Open);
        using var reader = new StreamReader(stream);
        await reader.ReadLineAsync();

        string line;
        while ((line = reader.ReadLine()) != null)
            {
                    try
                    {
                        var modelData = line.ToCsvData();
                        models.Add(modelData);
                    }
                    catch (Exception e)
                    {
                        Console.WriteLine($"Error parsing CSV data: {e.Message}");
                    }
            }
    }catch(Exception e){
        Console.WriteLine(e.Message);
    }finally{
        if(File.Exists(filePath)){
            try{
                File.Delete(filePath);
            }catch(Exception e){
                Console.WriteLine(e.Message);
            }
        }
    }
     int totalBatches = (int)Math.Ceiling(models.Count / 10000.0);
     Console.WriteLine(totalBatches);
      await BulkToMySQLAsync(models,id);
 }

  async Task BulkToMySQLAsync(List<CsvModel> models,int id)
        {
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
            int c = 1;
            for (int i = 0; i < rows.Count; i += 10000)
            {

                Console.WriteLine(c);
                 c++;
                 
                // await _rabbitDbProducer.Register(models.Skip(i).Take(BatchSize).ToList());
                await _producer.Register(models.Skip(i).Take(10000).ToList());
            }
           

            
        }

Console.WriteLine("Press [Enter] to exit");
Console.ReadLine();