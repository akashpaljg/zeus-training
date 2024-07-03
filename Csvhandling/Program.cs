using Csvhandling.Data;
using Csvhandling.Helper;
using Csvhandling.Models;
using Csvhandling.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MongoDB.Driver;
using MySqlConnector;
using System;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddCors();
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var serverVersion = new MySqlServerVersion(new Version(8, 0, 37));
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContextPool<ApplicationDbContext>(
    dbContextOptionsBuilder => dbContextOptionsBuilder.UseMySql(connectionString, serverVersion));
// Add services to the container.
builder.Services.Configure<StatusStoreDatabaseSettings>(
    builder.Configuration.GetSection("StatusStoreDatabase"));
builder.Services.AddSingleton<StatusService>();
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Check if the first argument is "worker"

    app.UseWebSockets();
    app.UseHttpsRedirection();
    app.UseAuthorization();
    app.UseCors(builder => builder
        .AllowAnyOrigin()
        .AllowAnyMethod()
        .AllowAnyHeader());

    app.MapControllers();

    app.Run();



