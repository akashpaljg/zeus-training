using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Csvhandling.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Csvhandling.Services;
 
public class StatusService
{
    private readonly IMongoCollection<StatusModel> _statusCollection;
    private ILogger<StatusService> _logger;
 
    public StatusService(
        IOptions<StatusStoreDatabaseSettings> mongoDbSettings)
    {
        var mongoClient = new MongoClient(
            mongoDbSettings.Value.ConnectionString);
 
        var mongoDatabase = mongoClient.GetDatabase(
            mongoDbSettings.Value.DatabaseName);
 
        _statusCollection = mongoDatabase.GetCollection<StatusModel>(
            mongoDbSettings.Value.StatusCollectionName);

            
            var _loggerFactory = LoggerFactory.Create(builder => builder
                .AddConsole()
                .AddDebug()
                .SetMinimumLevel(LogLevel.Debug)
            );
            _logger = _loggerFactory.CreateLogger<StatusService>();
    }
 
    public async Task<List<StatusModel>> GetAsync() =>
        await _statusCollection.Find(_ => true).ToListAsync();
 
    public async Task InsertStatus(string uid, string fid, string status) {
 
        var newStatusModel = new StatusModel{
           UId = uid,
           FId = fid,
           Status = status
        };
 
        await _statusCollection.InsertOneAsync(newStatusModel);
    }

    
   public async Task<string> GetStatus(string uid, string fid)
{
    try
    {
        var filter = Builders<StatusModel>.Filter.Eq(s => s.UId, uid) &
                     Builders<StatusModel>.Filter.Eq(s => s.FId, fid);
                     
        var statusModel = await _statusCollection.Find(filter).FirstOrDefaultAsync();
        return statusModel.Status;
    }
    catch (Exception e)
    {
        _logger.LogError($"Error occurred while getting status: {e.Message}");
        return "Error";
    }
}

public async Task<int> GetBatchProgress(string uid,string fid){
    try{
        var filter = Builders<StatusModel>.Filter.Eq(s=>s.UId,uid) &
                    Builders<StatusModel>.Filter.Eq(s=>s.FId,fid);
        var statusModel = await _statusCollection.Find(filter).FirstOrDefaultAsync();
        _logger.LogInformation("=== GetBatchProgress ===");
        _logger.LogInformation($"Curerent BatchCount is {statusModel.BatchCount}");
        _logger.LogInformation($"TotalBatches are {statusModel.TotalBatches}");
        var progress = (int)(statusModel.BatchCount*100.0/statusModel.TotalBatches);
        
        _logger.LogWarning("======");
        _logger.LogWarning(progress.ToString());
        _logger.LogWarning("======");
        return progress;
    }catch(Exception e){
        _logger.LogError($"Error occured while getting Progress. {e.Message}");
        return 0;
    }
}

 
    // public async Task UpdateAsync(string id, StatusModel updatedStatusModel) =>
    //     await _statusCollection.ReplaceOneAsync(x => x.Id == id, updatedStatusModel);
 
    // public async Task RemoveAsync(string id) =>
    //     await _statusCollection.DeleteOneAsync(x => x.Id == id);
}