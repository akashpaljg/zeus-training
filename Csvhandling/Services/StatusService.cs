using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Csvhandling.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.HttpResults;
using Polly;
using Polly.Contrib.WaitAndRetry;
using Polly.Retry;
using log4net;

namespace Csvhandling.Services;
 
public class StatusService
{

    
      private static readonly ILog _logger = log4net.LogManager.GetLogger
    (System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

    private readonly IMongoCollection<StatusModel> _statusCollection;
    // private ILogger<StatusService> _logger;
     private  readonly AsyncRetryPolicy _retryPolicy;
 
    public StatusService(
        IOptions<StatusStoreDatabaseSettings> mongoDbSettings)
    {
        var mongoClient = new MongoClient(
            mongoDbSettings.Value.ConnectionString);
 
        var mongoDatabase = mongoClient.GetDatabase(
            mongoDbSettings.Value.DatabaseName);
 
        _statusCollection = mongoDatabase.GetCollection<StatusModel>(
            mongoDbSettings.Value.StatusCollectionName);

            
            // var _loggerFactory = LoggerFactory.Create(builder => builder
            //     .AddConsole()
            //     .AddDebug()
            //     .SetMinimumLevel(LogLevel.Debug)
            // );
            // _logger = _loggerFactory.CreateLogger<StatusService>();

            var delay = Backoff.DecorrelatedJitterBackoffV2(TimeSpan.FromSeconds(1), retryCount: 5);
             _retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(delay, (exception, timeSpan, retryCount, context) =>
            {
                _logger.Error($"Retry {retryCount} encountered an error: {exception.Message}. Waiting {timeSpan} before next retry.");
            });
    }
 
    public async Task<List<StatusModel>> GetAsync() =>
        await _statusCollection.Find(_ => true).ToListAsync();
 
    public async Task InsertStatus(string uid, string fid, string status) {

        await _retryPolicy.ExecuteAsync(async ()=>{
            var newStatusModel = new StatusModel{
            UId = uid,
            FId = fid,
            Status = status
            };
    
            await _statusCollection.InsertOneAsync(newStatusModel);
        });
    }

    
   public async Task<string> GetStatus(string uid, string fid)
{
    try
    {
        var filter = Builders<StatusModel>.Filter.Eq(s => s.UId, uid) &
                     Builders<StatusModel>.Filter.Eq(s => s.FId, fid);
        
        StatusModel statusModel = new();
        await _retryPolicy.ExecuteAsync(async ()=>{
            statusModel = await _statusCollection.Find(filter).FirstOrDefaultAsync();
         });
                     
        return statusModel.Status;
    }
    catch (Exception e)
    {
        _logger.Error($"Error occurred while getting status: {e.Message}");
        return "Error";
    }
}

public async Task<int> GetBatchProgress(string uid,string fid){
    try{
        var filter = Builders<StatusModel>.Filter.Eq(s=>s.UId,uid) &
                    Builders<StatusModel>.Filter.Eq(s=>s.FId,fid);
        
        int progress = 0;
        
        await _retryPolicy.ExecuteAsync(async ()=>{
            var statusModel = await _statusCollection.Find(filter).FirstOrDefaultAsync();
            _logger.Info("=== GetBatchProgress ===");
            _logger.Info($"Curerent BatchCount is {statusModel.BatchCount}");
            _logger.Info($"TotalBatches are {statusModel.TotalBatches}");

            progress = (int)(statusModel.BatchCount*100.0/statusModel.TotalBatches);
        });
        
        _logger.Info("======");
        _logger.Info(progress.ToString());
        _logger.Info("======");
        return progress;
    }catch(Exception e){
        _logger.Error($"Error occured while getting Progress. {e.Message}");
        return 0;
    }
}

 
    // public async Task UpdateAsync(string id, StatusModel updatedStatusModel) =>
    //     await _statusCollection.ReplaceOneAsync(x => x.Id == id, updatedStatusModel);
 
    // public async Task RemoveAsync(string id) =>
    //     await _statusCollection.DeleteOneAsync(x => x.Id == id);
}