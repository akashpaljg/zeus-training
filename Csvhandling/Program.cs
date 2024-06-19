using Csvhandling.Data;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);


// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddCors();


// builder.Services.AddMySqlDataSource(builder.Configuration.GetConnectionString("DefaultConnection")!);
// builder.Services.AddTransient<MySqlConnection>(_ =>
//     new MySqlConnection(builder.Configuration.GetConnectionString("DefaultConnection")));
// builder.Services.AddDbConte<AppDbC>(options => options.UseMySql("server=localhost;user=user;password=password;database=db", serverVersion));
// builder.Services.AddDbContextPool<DataContext>(
//       options => options.UseMySql(Configuration.GetConnectionString("DefaultConnection")
//    ));
var serverVersion = new MySqlServerVersion(new Version(8, 0, 37));
// builder.Services.AddDbContext<ApplicationDbContext>(
//             dbContextOptions => dbContextOptions.UseMySQL("server=localhost;port=3306;database=csvhandle;user=root;password=password")
//                 // The following three options help with debugging, but should
//                 // be changed or removed for production.
//                 .LogTo(Console.WriteLine, LogLevel.Information)
//                 .EnableSensitiveDataLogging()
//                 .EnableDetailedErrors()
//         );

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContextPool<ApplicationDbContext>(
    dbContextOptionsBuilder => dbContextOptionsBuilder.UseMySql(connectionString, serverVersion));
// builder.EnrichMySqlDbContext<ApplicationDbContext>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.MapControllers();
app.UseCors(builder => builder
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

app.Run();

