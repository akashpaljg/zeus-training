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

        public StatusService()
        {
            var mongoClient = new MongoClient("mongodb://akash:akashpal@localhost:27017");
            var mongoDatabase = mongoClient.GetDatabase("test");
            _statusCollection = mongoDatabase.GetCollection<StatusModel>("Status");

            var _loggerFactory = LoggerFactory.Create(builder => builder
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
                var filter = Builders<StatusModel>.Filter.Eq(s => s.UId, id) &
                             Builders<StatusModel>.Filter.Eq(s => s.FId, fid) &
                             Builders<StatusModel>.Filter.ElemMatch(s => s.Batches, b => b.BId == bid);

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

        public async Task UpdateBatchCount(string id, string fid)
        {
            try
            {
                var filter = Builders<StatusModel>.Filter.Eq(s => s.UId, id) &
                             Builders<StatusModel>.Filter.Eq(s => s.FId, fid);
                var update = Builders<StatusModel>.Update.Inc(s => s.BatchCount, 1);

                var result = await _statusCollection.UpdateOneAsync(filter, update);

                if (result.MatchedCount > 0)
                {
                    _logger.LogInformation($"Successfully incremented BatchCount for id: {id} and fid: {fid}");
                }
                else
                {
                    _logger.LogWarning($"No document found with id: {id} and fid: {fid}");
                }
            }
            catch (Exception e)
            {
                _logger.LogError($"Error occurred while updating batch count: {e.Message}");
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

                if (document.Batches.Count != document.TotalBatches)
                {
                    _logger.LogWarning($"Batch count ({document.Batches.Count}) does not match TotalBatches ({document.TotalBatches}) for UId: {id} and FId: {fid}");
                    return;
                }

                bool allCompleted = document.Batches.All(batch => batch.BatchStatus == "Completed");
                List<string> errorBatchIds = document.Batches
                    .Where(batch => batch.BatchStatus == "Error")
                    .Select(batch => batch.BId)
                    .ToList();

                var updateDefinition = new List<UpdateDefinition<StatusModel>>();

                if (allCompleted)
                {
                    updateDefinition.Add(Builders<StatusModel>.Update.Set(s => s.Status, "Completed"));
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
    }
}
