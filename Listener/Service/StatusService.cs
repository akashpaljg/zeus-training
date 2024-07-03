using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Listener.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Listener.Service
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
    
    public async Task UpdateStatus(string id,string fid,string status){
       try
            {
                var filter = Builders<StatusModel>.Filter.Eq(s => s.UId, id) &
                             Builders<StatusModel>.Filter.Eq(s => s.FId, fid);
                var update = Builders<StatusModel>.Update.Set(s => s.Status, status);

                var result = await _statusCollection.UpdateOneAsync(filter, update);

                if (result.MatchedCount > 0)
                {
                    _logger.LogInformation($"Successfully updated status for id: {id} and fid: {fid}");
                }
                else
                {
                    _logger.LogWarning($"No document found with id: {id} and fid: {fid}");
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred while updating status: {e.Message}");
            }
    }

    public async Task UpdateTotalBatches(string id,string fid,int totalbatches){
       try
            {
                var filter = Builders<StatusModel>.Filter.Eq(s => s.UId, id) &
                             Builders<StatusModel>.Filter.Eq(s => s.FId, fid);
                var update = Builders<StatusModel>.Update.Set(s => s.TotalBatches, totalbatches);

                var result = await _statusCollection.UpdateOneAsync(filter, update);

                if (result.MatchedCount > 0)
                {
                    _logger.LogInformation($"Successfully updated totalBatches for id: {id} and fid: {fid}");
                }
                else
                {
                    _logger.LogWarning($"No document found with id: {id} and fid: {fid}");
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred while updating status: {e.Message}");
            }
    }

      public async Task AddBatch(string id,string fid,Batch batch){
       try
            {
                var filter = Builders<StatusModel>.Filter.Eq(s => s.UId, id) &
                             Builders<StatusModel>.Filter.Eq(s => s.FId, fid);
                var update = Builders<StatusModel>.Update.Push(s => s.Batches,batch);

                var result = await _statusCollection.UpdateOneAsync(filter, update);

                if (result.MatchedCount > 0)
                {
                    _logger.LogInformation($"Successfully updated batch for id: {id} and fid: {fid}");
                }
                else
                {
                    _logger.LogWarning($"No document found with id: {id} and fid: {fid}");
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