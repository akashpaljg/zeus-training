using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Csvhandling.Data;
using Csvhandling.Dtos;
using Csvhandling.Mappers;
using Csvhandling.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using System.Diagnostics;
using System.Net.WebSockets;
using Csvhandling.Helper;
using Polly;
using Polly.Contrib.WaitAndRetry;
using Polly.Retry;
using Csvhandling.Services;

namespace Csvhandling.Controllers
{
    [Route("api/check")]
    [ApiController]
    public class CsvController : ControllerBase
    {
        private int BatchSize ;
        private ILogger _logger;
        private RabbitProducer rabbitProducer;
        private readonly AsyncRetryPolicy _retryPolicy;

        private StatusService _statusService;

        public CsvController(StatusService _service)
        {
            var _loggerFactory = LoggerFactory.Create(
                builder => builder
                    .AddConsole()
                    .AddDebug()
                    .SetMinimumLevel(LogLevel.Debug)
            );
            _logger = _loggerFactory.CreateLogger<Program>();

            rabbitProducer = new RabbitProducer("localhost");
         

            // Define a jitter-based retry policy with Polly
            var delay = Backoff.DecorrelatedJitterBackoffV2(medianFirstRetryDelay: TimeSpan.FromSeconds(1), retryCount: 5);
            _retryPolicy = Policy
                .Handle<Exception>() // Handle all exceptions
                .WaitAndRetryAsync(delay, 
                    (exception, timeSpan, retryCount, context) => 
                    {
                        _logger.LogError($"Retry {retryCount} encountered an error: {exception.Message}. Waiting {timeSpan} before next retry.");
                    }
                );
                _statusService = _service;
        }

        [HttpGet]
        public async Task<IActionResult> GetHello()
        {
            try{
                var a = await _statusService.GetAsync();
                Console.WriteLine(a);
                _logger.LogInformation("Successfully Executed Comamnd");
            }catch(Exception e){
                _logger.LogError($"Error in exceuting command {e.Message}");
            }
            return Ok("Got");
        }

        [HttpPost]
        public async Task<IActionResult> UploadCsvFile([FromForm] IFormFile file, [FromForm] string id1, [FromForm] string id2)
        {
            _logger.LogWarning(id1.ToString());
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }
            Console.WriteLine("=======");
            Console.WriteLine(id1);
            Console.WriteLine(id2);
            Console.WriteLine("=======");
            var filePath = Path.GetTempFileName();
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await _retryPolicy.ExecuteAsync(async () =>
                {
                    await file.CopyToAsync(stream);
                });
            }

            try
            {
                Console.WriteLine("registering");
                Console.WriteLine(filePath);
                await _statusService.InsertStatus(id1,id2, "Waiting");
                // int statusId = await _statusService.GetId(id);
                Console.WriteLine("=======");
                Console.WriteLine(1);
                Console.WriteLine("=======");

                // Apply the Polly retry policy to the RabbitMQ registration
                await _retryPolicy.ExecuteAsync(async () =>
                {
                    await rabbitProducer.Register(filePath, id1,id2);
                });

                Console.WriteLine("Successfully");
                return Ok(new { file.ContentType, file.Length, file.FileName });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
    }
}
