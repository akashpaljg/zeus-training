using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Csvhandling.Models
{
    public class Batch{
        public int BId { get; set; }
        public string BatchStatus { get; set; } = string.Empty;

        public int BatchStart { get; set; }
        public int BatchEnd { get; set; }
        
    }
    public class StatusModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        
        public int UId { get; set; }
        
        public List<Batch> Batches { get; set; } = null!;
        
        public string Status { get; set; } = null!;
        
        public int TotalBatches { get; set; }
    }

    
}