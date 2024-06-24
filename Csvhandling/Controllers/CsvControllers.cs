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

namespace Csvhandling.Controllers
{
    [Route("api/check")]
    [ApiController]
    public class CsvController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private static readonly Dictionary<int, WebSocket> _websockets = new Dictionary<int, WebSocket>();
        private int BatchSize ;

        public CsvController(ApplicationDbContext dbContext)
        {
            _context = dbContext;
        }

        [HttpGet]
        public IActionResult GetHello()
        {
            return Ok("Got");
        }

        [HttpGet("ws/{id}")]
        public async Task GetConnection(int id)
        {
            if (HttpContext.WebSockets.IsWebSocketRequest)
            {
                var webSocket = await HttpContext.WebSockets.AcceptWebSocketAsync();
                Console.WriteLine("WebSocket connection established");

                lock (_websockets)
                {
                    _websockets[id] = webSocket;
                }

                await Echo(id);
            }
            else
            {
                Console.WriteLine("WebSocket connection not established");
            }
        }

        private async Task Echo(int id)
        {
            byte[] buffer = new byte[1024 * 4];
            WebSocket webSocket;

            lock (_websockets)
            {
                webSocket = _websockets[id];
            }

            WebSocketReceiveResult result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            while (!result.CloseStatus.HasValue)
            {
                await webSocket.SendAsync(new ArraySegment<byte>(buffer, 0, result.Count), result.MessageType, result.EndOfMessage, CancellationToken.None);
                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
            }

            lock (_websockets)
            {
                _websockets.Remove(id);
            }

            await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }

        private async Task SendProgress(int id, int percentage)
        {
            WebSocket webSocket;

            lock (_websockets)
            {
                Console.WriteLine($"I'm in send Progress {id} {percentage}");
                if (!_websockets.TryGetValue(id, out webSocket) || webSocket.State != WebSocketState.Open)
                {
                    Console.WriteLine("Unable to send progress: WebSocket not open or not found.");
                    return;
                }
            }

            var message = Encoding.UTF8.GetBytes($"{percentage}");
            await webSocket.SendAsync(new ArraySegment<byte>(message, 0, message.Length), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        [HttpPost("{id}")]
        public async Task<IActionResult> UploadCsvFile(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            var filePath = Path.GetTempFileName();

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
                    
                    mConnection.Open();
                    
                    using var transactions = await mConnection.BeginTransactionAsync();
                    
                    for (int i = 0; i < Rows.Count; i += BatchSize)
                    {
                        sCommand.Append(string.Join(",", Rows.Skip(i).Take(BatchSize)));
                        sCommand.Append(';');

                        using (MySqlCommand myCmd = new MySqlCommand(sCommand.ToString(), mConnection))
                        {
                            myCmd.Transaction = transactions; // DAP error resolved
                            myCmd.CommandType = System.Data.CommandType.Text;
                            try
                            {
                                await myCmd.ExecuteNonQueryAsync();
                                sCommand = new StringBuilder(sCommand2);
                            }
                            catch (Exception e)
                            {
                                Console.WriteLine(e.Message);
                                await transactions.RollbackAsync();
                            }
                        }

                        int progress = (int)(((i + BatchSize) / (double)Rows.Count) * 100);
                        Console.WriteLine($"i:{i} BatchSize: {BatchSize} RowsCount: {Rows.Count}");
                        await SendProgress(id, progress);
                    }
                    await transactions.CommitAsync();
                }
            }

            try
            {
                var stream = new MemoryStream();
                await file.CopyToAsync(stream);
                stream.Position = 0;

                var models = new List<CsvModel>();
                using (var reader = new StreamReader(stream))
                {
                    string line;
                    bool isHeader = true;

                    while ((line = reader.ReadLine()) != null)
                    {
                        if (isHeader)
                        {
                            isHeader = false;
                            continue;
                        }
                        try
                        {
                            models.Add(line.ToCsvData());
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Error parsing line: {line}. Exception: {ex.Message}");
                        }
                    }
                }

                BatchSize = models.Count > 100? models.Count/100:models.Count;
                

                Stopwatch st = new Stopwatch();
                st.Start();
                await BulkToMySQLAsync(models);
                Console.WriteLine(st.Elapsed);
                st.Stop();

                return Ok(new { file.ContentType, file.Length, file.FileName });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.StackTrace);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
            finally
            {
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
        }
    }
}
