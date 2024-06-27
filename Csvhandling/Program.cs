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

// Check if the first argument is "worker"
if (args.Length > 0)
{
    if (args[0].ToLower() == "worker")
    {
        StartWorker();
    }
    else if (args[0].ToLower() == "listener")
    {
        StartDbListener();
    }
    else
    {
        StartServer();
    }
}
else
{
    StartServer();
}

static void StartWorker()
{
    var worker = new RabbitListener("localhost");
    try
    {
        worker.Register();
        Console.WriteLine("Workers are running...");
    }
    catch (Exception e)
    {
        Console.WriteLine(e.Message);
    }

    // Keep the worker running
    while (true)
    {
        // Add logic to keep the worker alive
        System.Threading.Thread.Sleep(1000);
    }
}

void StartServer()
{
    app.UseWebSockets();
    app.UseHttpsRedirection();
    app.UseAuthorization();
    app.UseCors(builder => builder
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());

    app.MapControllers();

    app.Run();
}

static void StartDbListener()
{
    RabbitDbListener _rabbitdblistener = new RabbitDbListener("localhost");
    try
    {
        _rabbitdblistener.Register();
        Console.WriteLine("Listeners are running...");
    }
    catch (Exception e)
    {
        Console.WriteLine(e.Message);
    }

    // Keep the worker running
    while (true)
    {
        // Add logic to keep the worker alive
        System.Threading.Thread.Sleep(1000);
    }
}
