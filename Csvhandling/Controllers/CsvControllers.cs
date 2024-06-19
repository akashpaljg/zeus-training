using System;
using System.IO;
using System.Threading.Tasks;
using Csvhandling.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Csvhandling.Controllers
{
    [Route("api/check")]
    [ApiController]
    public class CsvControllers : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public CsvControllers(ApplicationDbContext dbContext)
        {
            _context = dbContext;
        }

        [HttpGet]
        public IActionResult GetHello()
        {
            return Ok("Got");
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetHelloId(int id)
        {
            var existUser = await _context.csvData.FirstOrDefaultAsync(s => s.Id == id);
            if (existUser == null)
            {
                return NotFound();
            }
            return Ok(existUser);
        }

        [HttpPost]
        public async Task<IActionResult> GetFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                // Save the file to a temporary location
                var filePath = Path.GetTempFileName();
                Console.WriteLine(filePath);
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Optionally read the file content
                using (var reader = new StreamReader(filePath))
                {
                    var fileContent = await reader.ReadToEndAsync();
                    Console.WriteLine(fileContent); // Or process the content as needed
                }

                return Ok(new { file.ContentType, file.Length, file.FileName });
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }
    }
}
