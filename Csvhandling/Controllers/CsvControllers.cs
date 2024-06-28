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
using BookStoreApi.Services;

namespace Csvhandling.Controllers
{
    [Route("api/check")]
    [ApiController]
    public class CsvController : ControllerBase
    {
        // private readonly ApplicationDbContext _context;
        private static readonly Dictionary<int, WebSocket> _websockets = new Dictionary<int, WebSocket>();
        private int BatchSize ;
        private ILogger _logger;
        private RabbitListener rabbitListener;
        private RabbitProducer rabbitProducer;
        private readonly StatusService _statusService;

        public CsvController(StatusService statusService)
        {
            // _context = dbContext; 
            Console.WriteLine(statusService);
            var _loggerFactory = LoggerFactory.Create(
            builder => builder
                        // add console as logging target
                        .AddConsole()
                        // add debug output as logging target
                        .AddDebug()
                        // set minimum level to log
                        .SetMinimumLevel(LogLevel.Debug)
        );
        _logger = _loggerFactory.CreateLogger<Program>();
      
        rabbitProducer = new RabbitProducer("localhost");
        _statusService = statusService;
        }

        [HttpGet]
        public async Task<IActionResult> GetHello()
        {
            try{
                Console.WriteLine("getting connection");
                Console.WriteLine(await _statusService.GetAsync());
                Console.WriteLine("connection established");
            }catch(Exception e){
                Console.WriteLine(e.Message);
            }
            
            return Ok("Got");
        }

        [HttpPost]
        public async Task<IActionResult> UploadCsvFile( IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }


            

            var filePath = Path.GetTempFileName();
            using(var stream = new FileStream(filePath,FileMode.Create)){
                await file.CopyToAsync(stream);
            }


            try
            {
                Console.WriteLine("registering");                        
                Console.WriteLine(filePath); 
                await rabbitProducer.Register(filePath);
                Console.WriteLine("Suucessfully");
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
