using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DbListener.Models;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace DbListener.Service
{
    public class StatusService
    {
       private readonly IMongoCollection<StatusModel> _statusCollection;
        private readonly ILogger<StatusService> _logger;

// {
  
//     "ConnectionStrings": {
//     "DefaultConnection": "server=localhost;port=3306;database=csvhandle;user=root;password=password",
//     "Default": "Server=localhost;User ID=root;Password=password;Database=csvhandle"
    
//     },
//     "StatusStoreDatabase": {
//         "ConnectionString": "mongodb://akash:akashpal@localhost:27017",
//         "DatabaseName": "test",
//         "StatusCollectionName": "Status"
//     },
//   "Logging": {
//     "LogLevel": {
//       "Default": "Information",
//       "Microsoft.AspNetCore": "Warning"
//     }
//   },
//   "AllowedHosts": "*"
// }

    public StatusService()
    {
        var mongoClient = new MongoClient(
            "mongodb://akash:akashpal@localhost:27017");

        var mongoDatabase = mongoClient.GetDatabase(
            "test");

        _statusCollection = mongoDatabase.GetCollection<StatusModel>(
            "Status");

            var _loggerFactory = LoggerFactory.Create(
                builder => builder
                    .AddConsole()
                    .AddDebug()
                    .SetMinimumLevel(LogLevel.Debug)
            );
            _logger = _loggerFactory.CreateLogger<StatusService>();
    }

    public async Task<List<StatusModel>> GetAsync() =>
        await _statusCollection.Find(_ => true).ToListAsync();

    public async Task UpdateBatchStatus(string id, string fid, string bid, string status)
{
    try
    {
        var filter = Builders<StatusModel>.Filter.And(
            Builders<StatusModel>.Filter.Eq(s => s.UId, id),
            Builders<StatusModel>.Filter.Eq(s => s.FId, fid),
            Builders<StatusModel>.Filter.ElemMatch(s => s.Batches, b => b.BId == bid)
        );

        var update = Builders<StatusModel>.Update.Set("Batches.$.BatchStatus", status);

        var result = await _statusCollection.UpdateOneAsync(filter, update);

        if (result.MatchedCount > 0)
        {
            _logger.LogInformation($"Successfully updated batch status for UId: {id}, FId: {fid}, BId: {bid}");
        }
        else
        {
            _logger.LogWarning($"No document found with UId: {id}, FId: {fid}, and BId: {bid}");
        }
    }
    catch (Exception e)
    {
        _logger.LogError($"Error occurred while updating batch status: {e.Message}");
    }
}

 public async Task Check(string id, string fid)
{
    try
    {
        var filter = Builders<StatusModel>.Filter.And(
            Builders<StatusModel>.Filter.Eq(s => s.UId, id),
            Builders<StatusModel>.Filter.Eq(s => s.FId, fid)
        );

        var document = await _statusCollection.Find(filter).FirstOrDefaultAsync();

        if (document == null)
        {
            _logger.LogWarning($"No document found with UId: {id} and FId: {fid}");
            return;
        }

        bool allCompleted = true;
        List<string> errorBatchIds = new List<string>();

        foreach (var batch in document.Batches)
        {
            if (batch.BatchStatus != "Completed")
            {
                allCompleted = false;
                if (batch.BatchStatus == "Error")
                {
                    errorBatchIds.Add(batch.BId);
                }
            }
        }

        var updateDefinition = new List<UpdateDefinition<StatusModel>>();

        if (allCompleted)
        {
            updateDefinition.Add(Builders<StatusModel>.Update.Set(s => s.Status, "Completed"));
            // await _statusCollection.UpdateOneAsync(document.Status,"Completed");
        }
        else if (errorBatchIds.Count > 0)
        {
            var errorMessage = $"Error occurred in batches: {string.Join(", ", errorBatchIds)}";
            updateDefinition.Add(Builders<StatusModel>.Update.Set(s => s.Status, errorMessage));
        }

        if (updateDefinition.Count > 0)
        {
            var combinedUpdate = Builders<StatusModel>.Update.Combine(updateDefinition);
            var updateResult = await _statusCollection.UpdateOneAsync(filter, combinedUpdate);

            if (updateResult.MatchedCount > 0)
            {
                _logger.LogInformation($"Successfully updated status for UId: {id} and FId: {fid}");
            }
            else
            {
                _logger.LogWarning($"Failed to update status for UId: {id} and FId: {fid}");
            }
        }
    }
    catch (Exception e)
    {
        _logger.LogError($"Error occurred while updating status: {e.Message}");
    }
}





    // public async Task<Book?> GetAsync(string id) =>
    //     await _statusCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    // public async Task CreateAsync(Book newBook) =>
    //     await _statusCollection.InsertOneAsync(newBook);

    // public async Task UpdateAsync(string id, Book updatedBook) =>
    //     await _statusCollection.ReplaceOneAsync(x => x.Id == id, updatedBook);

    // public async Task RemoveAsync(string id) =>
    //     await _statusCollection.DeleteOneAsync(x => x.Id == id);
     
    }
}