using System;
using System.Text.Json; // Use System.Text.Json for JSON serialization
using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using System.Threading.Tasks;
using Csvhandling.Models;

namespace BookStoreApi.Services
{
    public class StatusService
    {
        private MySqlConnection _connection;
        private readonly ILogger _logger;

        public StatusService(ILogger<StatusService> logger)
        {
            _connection = new MySqlConnection("server=localhost;port=3306;database=csvhandle;user=root;password=password;AllowUserVariables=true");
            _logger = logger;
        }

        public async Task ConnectDb()
        {
            try
            {
                if (_connection.State != System.Data.ConnectionState.Open)
                {
                    await _connection.OpenAsync();
                    _logger.LogInformation("DB connected successfully.");
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Error connecting to the database: {e.Message}");
            }
        }

        public async Task DisconnectDb()
        {
            try
            {
                if (_connection.State != System.Data.ConnectionState.Closed)
                {
                    await _connection.CloseAsync();
                    _logger.LogInformation("DB disconnected successfully.");
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Error disconnecting from the database: {e.Message}");
            }
        }

        public async Task InsertStatus(string id, string status)
        {
            try
            {
                await ConnectDb();
                var command = new MySqlCommand("INSERT INTO batchstatus (UId, Status) VALUES (@UId, @Status)", _connection);
                command.Parameters.AddWithValue("@UId", id);
                command.Parameters.AddWithValue("@Status", status);

                var a = await command.ExecuteNonQueryAsync();
                _logger.LogInformation($"Inserted successfully {status} and {id} into batchstatus");
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred: {e.Message}");
            }
            finally
            {
                await DisconnectDb();
            }
        }

        public async Task<int> GetId(string id)
        {
            try
            {
                await ConnectDb();
                _logger.LogInformation($"StatusService: {id}");
                var command = new MySqlCommand("SELECT Id FROM batchstatus WHERE UId = @UId", _connection);
                command.Parameters.AddWithValue("@UId", id);
                object result = await command.ExecuteScalarAsync();

                if (result != null && int.TryParse(result.ToString(), out int a))
                {
                    _logger.LogInformation($"Successfully got Id: {a} from batchstatus");
                    return a;
                }
                else
                {
                    _logger.LogWarning($"No Id found for UId: {id}");
                    return 0;
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred: {e.Message}");
                return 0;
            }
            finally
            {
                await DisconnectDb();
            }
        }

        public async Task ProcessingUploadingStatus(int id, string status)
        {
            try
            {
                await ConnectDb();
                var command = new MySqlCommand("UPDATE batchstatus SET Status = @Status WHERE Id = @UId", _connection);
                command.Parameters.AddWithValue("@UId", id);
                command.Parameters.AddWithValue("@Status", status);

                await command.ExecuteNonQueryAsync();
                _logger.LogInformation($"Updated status to {status} for UId {id} in batchstatus");
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred: {e.Message}");
            }
            finally
            {
                await DisconnectDb();
            }
        }

        public async Task UpdateStatus(int totalBatches, string status, int id)
        {
            try
            {
                await ConnectDb();
                var command = new MySqlCommand("UPDATE batchstatus SET TotalBatches = @TotalBatches, Status = @Status WHERE Id = @UId", _connection);
                command.Parameters.AddWithValue("@TotalBatches", totalBatches);
                command.Parameters.AddWithValue("@Status", status);
                command.Parameters.AddWithValue("@UId", id);

                await command.ExecuteNonQueryAsync();
                _logger.LogInformation($"Updated status to {status} and totalBatches to {totalBatches} for UId {id} in batchstatus");
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred: {e.Message}");
            }
            finally
            {
                await DisconnectDb();
            }
        }

        public async Task UpdateStatus(Batch batch, string status, int id)
        {
            try
            {
                await ConnectDb();

                // Serialize the Batch object to a JSON string
                string batchJson = JsonSerializer.Serialize(batch);

                var command = new MySqlCommand("UPDATE batchstatus SET Status = @Status, Batches = @Batches WHERE Id = @UId", _connection);
                command.Parameters.AddWithValue("@Status", status);
                command.Parameters.AddWithValue("@Batches", batchJson);
                command.Parameters.AddWithValue("@UId", id);

                await command.ExecuteNonQueryAsync();
                _logger.LogInformation($"Updated status to {status} and batch to {batchJson} for UId {id} in batchstatus");
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred: {e.Message}");
            }
            finally
            {
                await DisconnectDb();
            }
        }

        public async Task UpdateBatchStatus(int BId, int Id, string status)
        {

            Console.WriteLine("UpdateBatchStatus");
            try
            {
                await ConnectDb();
                var command  = new MySqlCommand("Select batches from where Id = @Id",_connection);
                command.Parameters.AddWithValue("@Id",Id);
                string? result = (await command.ExecuteScalarAsync())?.ToString();
                // result = result.ToString();
                List<Batch>? batchess = JsonSerializer.Deserialize<List<Batch>>(result);
                Batch bResult = batchess.FirstOrDefault(s=>s.BId == BId);
                Console.WriteLine(bResult.BId);
                // var command = new MySqlCommand("UPDATE batchstatus SET Status = @Status WHERE Id = @UId AND Batches.BId = @BId", _connection);
                // command.Parameters.AddWithValue("@UId", Id);
                // command.Parameters.AddWithValue("@BId", BId);
                // command.Parameters.AddWithValue("@Status", status);

                // await command.ExecuteNonQueryAsync();
                _logger.LogInformation($"Updated status to {status} for Batch {BId} and UId {Id} in batchstatus");
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred: {e.Message}");
            }
            finally
            {
                await DisconnectDb();
            }
        }
    }
}
