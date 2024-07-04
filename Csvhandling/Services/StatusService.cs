using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Csvhandling.Models;

namespace Csvhandling.Services;
 
public class StatusService
{
    private readonly IMongoCollection<StatusModel> _statusCollection;
 
    public StatusService(
        IOptions<StatusStoreDatabaseSettings> mongoDbSettings)
    {
        var mongoClient = new MongoClient(
            mongoDbSettings.Value.ConnectionString);
 
        var mongoDatabase = mongoClient.GetDatabase(
            mongoDbSettings.Value.DatabaseName);
 
        _statusCollection = mongoDatabase.GetCollection<StatusModel>(
            mongoDbSettings.Value.StatusCollectionName);
    }
 
    public async Task<List<StatusModel>> GetAsync() =>
        await _statusCollection.Find(_ => true).ToListAsync();
 
    // public async Task<StatusModel?> GetAsync(string id) =>
    //     await _statusCollection.Find(x => x.Id == id).FirstOrDefaultAsync();
 
    public async Task InsertStatus(string uid, string fid, string status) {
 
        var newStatusModel = new StatusModel{
           UId = uid,
           FId = fid,
           Status = status
        };
 
        await _statusCollection.InsertOneAsync(newStatusModel);
    }
 
    // public async Task UpdateAsync(string id, StatusModel updatedStatusModel) =>
    //     await _statusCollection.ReplaceOneAsync(x => x.Id == id, updatedStatusModel);
 
    // public async Task RemoveAsync(string id) =>
    //     await _statusCollection.DeleteOneAsync(x => x.Id == id);
}