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
using EFCore.BulkExtensions.SqlAdapters.MySql;
// using MySql.Data.MySqlClient;
using System.Data.Common;
using System.Data;
using Dapper;
using System.Text.Json;
using Csvhandling.Mappers;

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

        private MySqlConnection _mySqlConnection;

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
                _mySqlConnection = new MySqlConnection("server=localhost;port=3306;database=csvhandle;user=root;password=password");
        }

        [HttpGet]
        [Route("status/{id1}/{fid}")]
        public async Task<IActionResult> GetHello(string id1,string fid)
        {
            try{
                // var a = await _statusService.GetAsync();
                Console.WriteLine("=====Status Get=====");
                Console.WriteLine(id1);
                Console.WriteLine(fid);
                Console.WriteLine("=====Status Get=====");

                 var a = await _statusService.GetStatus(id1,fid);
                 var progress = await _statusService.GetBatchProgress(id1,fid);
                 Console.WriteLine(a);
                    _logger.LogInformation("Successfully Executed Comamnd");
                  
                    return Ok(new {status=a,progress=progress});
            }catch(Exception e){
                _logger.LogError($"Error in exceuting command {e.Message}");
                return BadRequest("Error occured");
            }
        }

        [HttpGet]
        [Route("delete/{id}")]
        public async Task<IActionResult> DeleteId(int id){
            try{
            await _retryPolicy.ExecuteAsync(async ()=>{
                    await _mySqlConnection.OpenAsync();
                    _logger.LogInformation("Connection established");
                    var transaction = await _mySqlConnection.BeginTransactionAsync();
                   using (var command = new MySqlCommand("Delete from csvhandle.csvdata where Id=@id",_mySqlConnection,transaction)){
                    command.CommandType = System.Data.CommandType.Text;
                    command.Parameters.Add(new MySqlParameter("@id",id));
                    try{
                        await command.ExecuteNonQueryAsync();
                        await transaction.CommitAsync();
                        _logger.LogInformation("Deleted Successfully");
                    }catch(Exception e){
                        await transaction.RollbackAsync();
                        _logger.LogError($"Error occured {e.Message}");
                    }
                   }
                
                    await _mySqlConnection.CloseAsync();
                 });

                 return Ok("Deleted Successfully");

                }catch(Exception e){
                    _logger.LogError($"Error occured while getting data from DB {e.Message}");
                    return BadRequest();
                }
        }

        [HttpPost]
        [Route("update")]
        public async Task<IActionResult> UpdateData([FromBody] CsvModel updatedModel){
            try{
                Console.WriteLine(updatedModel.Id);
                CsvModel model = updatedModel.ValidateModel();
                    
                _logger.LogInformation("Got Data");

                 var sCommand = new StringBuilder("REPLACE INTO csvdata (Id,EmailId,Name,Country,State,City,TelephoneNumber,AddressLine1,AddressLine2,DateOfBirth,FY2019_20,FY2020_21,FY2021_22,FY2022_23,FY2023_24) VALUES ");

                var rows =
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
                        model.FY2023_24);
                sCommand.Append(string.Join(",", rows));

                await _retryPolicy.ExecuteAsync(async ()=>{
                await _mySqlConnection.OpenAsync();
                var transaction = await _mySqlConnection.BeginTransactionAsync();
                using (var command = new MySqlCommand(sCommand.ToString(),_mySqlConnection,transaction)){
                    command.CommandType = System.Data.CommandType.Text;
                    try{
                        await command.ExecuteNonQueryAsync();
                        await transaction.CommitAsync();
                        _logger.LogInformation("Updated Successfully");
                    }catch(Exception e){
                        _logger.LogError($"Error at updating {e.Message}");
                        await transaction.RollbackAsync();
                    }
                }
            });
            return Ok();
            }catch(Exception e){
                Console.WriteLine($"Error is {e.Message}");
                return BadRequest("Incorrect format of Data");
            }
        }

        [HttpGet]
        [Route("data")]
        public async Task<IActionResult> GetData()
        {
            IEnumerable<CsvModel> csvData = null ;

            
            try{
                Console.WriteLine("=====Data Get=====");

                await _retryPolicy.ExecuteAsync(async ()=>{
                    
                    await _mySqlConnection.OpenAsync();
                    
                    _logger.LogInformation("Connection established");

                    csvData = await _mySqlConnection.QueryAsync<CsvModel>("select * from csvhandle.csvdata limit 10;");
                    await _mySqlConnection.CloseAsync();
                    
                    
                 });
                 return Ok(new {data = csvData});
                }catch(Exception e){
                    _logger.LogError($"Error occured while getting data from DB {e.Message}");
                    return BadRequest();
                }


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
