using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace DbListener.Models
{
    public class Batch
    {
        [BsonElement("BId")]
        public string BId { get; set; } = string.Empty;

        [BsonElement("BatchStatus")]
        public string BatchStatus { get; set; } = string.Empty;

        [BsonElement("BatchStart")]
        public int BatchStart { get; set; }

        [BsonElement("BatchEnd")]
        public int BatchEnd { get; set; }
    }

    public class StatusModel
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("UId")]
        public string UId { get; set; } = string.Empty;
        
        [BsonElement("FId")]
        public string FId { get; set; } = string.Empty;

        [BsonElement("Status")]
        public string Status { get; set; } = null!;

        [BsonElement("TotalBatches")]
        public int TotalBatches { get; set; }
        
        [BsonElement("BatchCount")]
        public int BatchCount {get;set;}

        [BsonElement("Batches")]
        public List<Batch> Batches { get; set; } = null!;
    }
}