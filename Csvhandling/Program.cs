using Csvhandling.Data;
using Csvhandling.Helper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MySqlConnector;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddCors();

var serverVersion = new MySqlServerVersion(new Version(8, 0, 37));
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContextPool<ApplicationDbContext>(
    dbContextOptionsBuilder => dbContextOptionsBuilder.UseMySql(connectionString, serverVersion));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// if (args.Length > 0 && args[0].ToLower() == "listener")
// {
//     try
//     {
//         RabbitListener rabbitListener = new RabbitListener("localhost",5672);
//         rabbitListener.Register();
//         Console.WriteLine("RabbitMQ Listener Started");
//     }
//     catch (Exception ex)
//     {
//         Console.WriteLine($"Error starting RabbitMQ listener: {ex.Message}");
//         throw;
//     }
// }else{
//     CreateHostBuilder(args);
// }



// static IHostBuilder CreateHostBuilder(string[] args)
// {
//     return Host.CreateDefaultBuilder(args)
//         .ConfigureWebHostDefaults(webBuilder =>
//         {
//             webBuilder.UseStartup<Startup>();
//             // webBuilder.UseUrls("http://localhost:5000"); 
//         });
// }

if (args.Length > 0 && args[0].ToLower() == "worker")
        {
            StartWorker();
        }
        else
        {
            CreateHostBuilder(args).Build().Run();
        }
 
 
static void StartWorker()
    {
        var worker = new RabbitListener("localhost");
        worker.Register();
    }
 
static IHostBuilder CreateHostBuilder(string[] args)
{
    return Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.UseStartup<Startup>();
        });
}
 





app.UseWebSockets();

app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.MapControllers();


app.Run();
