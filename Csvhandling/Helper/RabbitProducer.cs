using System;
using System.Text;
using System.Threading.Tasks;
using Polly;
using Polly.Contrib.WaitAndRetry;
using Polly.Retry;
using RabbitMQ.Client;

namespace Csvhandling.Helper
{
    public class RabbitProducer
    {
        private readonly ConnectionFactory _factory;
        private readonly IConnection _connection;
        private readonly IModel _channel;
        private ILogger _logger;
        private readonly AsyncRetryPolicy _retryPolicy;
        public RabbitProducer(string hostName)
        {
           var _loggerFactory = LoggerFactory.Create(
                builder => builder
                    .AddConsole()
                    .AddDebug()
                    .SetMinimumLevel(LogLevel.Debug)
            );
            _logger = _loggerFactory.CreateLogger<RabbitProducer>();

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
              var delay = Backoff.DecorrelatedJitterBackoffV2(medianFirstRetryDelay: TimeSpan.FromSeconds(1), retryCount: 5);
            _retryPolicy = Policy
                .Handle<Exception>() // Handle all exceptions
                .WaitAndRetryAsync(delay, 
                    (exception, timeSpan, retryCount, context) => 
                    {
                        _logger.LogError($"Retry {retryCount} encountered an error: {exception.Message}. Waiting {timeSpan} before next retry.");
                    }
                );
        }

        public async Task Register(string filePath, string uid, string fid)
        {
            Console.WriteLine($"I'm registering RabbitProducer Id: {uid} | {fid}");

            _channel.QueueDeclare(queue: "wello2", durable: false, exclusive: false, autoDelete: false, arguments: null);

            await _retryPolicy.ExecuteAsync(async ()=>{
                var body = Encoding.UTF8.GetBytes($"{filePath}|{uid}|{fid}");

                 Console.WriteLine("Encoded data in queue: Producer");

                _channel.BasicPublish(exchange: string.Empty,
                                  routingKey: "wello2",
                                  basicProperties: null,
                                  body: body);
            });

            Console.WriteLine(" [x] Sent File");
        }

        public void Deregister()
        {
            _connection.Close();
        }
    }
}
