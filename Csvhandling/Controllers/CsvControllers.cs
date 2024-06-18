using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;

namespace Csvhandling.Controllers
{
    [Route("api/check")]
        
    public class CsvControllers : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> GetHello(){
            using var connection = new MySqlConnection("Server=localhost;User ID=root;Password=password;Database=csvdata");
            await connection.OpenAsync();

            using var command = new MySqlCommand("SELECT * FROM csvhandle;", connection);
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var value = reader.GetValue(0);
                Console.WriteLine("---------");
                Console.WriteLine(reader);
                Console.WriteLine("---------");
            }

            return Ok("hello");
        }

        [Route("{id}")]
        [HttpGet]
        public async Task<IActionResult> GetHelloId(int id){
            return Ok(id);
        }

    }
}