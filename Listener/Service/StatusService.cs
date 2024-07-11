using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Listener.Models;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;
using log4net;

namespace Listener.Service
{
    public class StatusService
    {
         private static readonly ILog _logger = LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);
        private readonly IMongoCollection<StatusModel> _statusCollection;
        // private readonly ILogger<StatusService> _logger;

        public StatusService()
        {
            var mongoClient = new MongoClient("mongodb://akash:akashpal@localhost:27017");
            var mongoDatabase = mongoClient.GetDatabase("test");
            _statusCollection = mongoDatabase.GetCollection<StatusModel>("Status");

            // var _loggerFactory = LoggerFactory.Create(builder => builder
            //     .AddConsole()
            //     .AddDebug()
            //     .SetMinimumLevel(LogLevel.Debug));
            // _logger = _loggerFactory.CreateLogger<StatusService>();
        }

        public async Task<List<StatusModel>> GetAsync() =>
            await _statusCollection.Find(_ => true).ToListAsync();

        public async Task UpdateStatus(string id, string fid, string status)
        {
            try
            {
                var filter = Builders<StatusModel>.Filter.Eq(s => s.UId, id) &
                             Builders<StatusModel>.Filter.Eq(s => s.FId, fid);
                var update = Builders<StatusModel>.Update.Set(s => s.Status, status);

                var result = await _statusCollection.UpdateOneAsync(filter, update);

                if (result.MatchedCount > 0)
                {
                    _logger.Info($"Successfully updated status for id: {id} and fid: {fid}");
                }
                else
                {
                    _logger.Warn($"No document found with id: {id} and fid: {fid}");
                }
            }
            catch (Exception e)
            {
                _logger.Error($"Error occurred while updating status: {e.Message}");
            }
        }

        
        public async Task UpdateTotalBatches(string id, string fid, int totalBatches)
        {
            try
            {
                var filter = Builders<StatusModel>.Filter.Eq(s => s.UId, id) &
                             Builders<StatusModel>.Filter.Eq(s => s.FId, fid);
                var update = Builders<StatusModel>.Update.Set(s => s.TotalBatches, totalBatches);

                var result = await _statusCollection.UpdateOneAsync(filter, update);

                if (result.MatchedCount > 0)
                {
                    _logger.Info($"Successfully updated TotalBatches for id: {id} and fid: {fid}");
                }
                else
                {
                    _logger.Warn($"No document found with id: {id} and fid: {fid}");
                }
            }
            catch (Exception e)
            {
                _logger.Error($"Error occurred while updating total batches: {e.Message}");
            }
        }

        public async Task AddBatch(string id, string fid, Batch batch)
        {
            try
            {
                var filter = Builders<StatusModel>.Filter.Eq(s => s.UId, id) &
                             Builders<StatusModel>.Filter.Eq(s => s.FId, fid);
                var update = Builders<StatusModel>.Update.Push(s => s.Batches, batch);

                var result = await _statusCollection.UpdateOneAsync(filter, update);

                if (result.MatchedCount > 0)
                {
                    _logger.Info($"Successfully added batch for id: {id} and fid: {fid}");
                }
                else
                {
                    _logger.Warn($"No document found with id: {id} and fid: {fid}");
                }
            }
            catch (Exception e)
            {
                _logger.Error($"Error occurred while adding batch: {e.Message}");
            }
        }
    }
}
