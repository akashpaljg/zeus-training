using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DbListener.Models
{
    public class CsvModel
    {
        public int Id { get; set; }
        public string EmailId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string TelephoneNumber { get; set; } = string.Empty;
        public string AddressLine1 { get; set; } = string.Empty;
        public string AddressLine2 { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; } = DateTime.Now;
        public long FY2019_20 { get; set; }
        public long FY2020_21 { get; set; }
        public long FY2021_22 { get; set; }
        public long FY2022_23 { get; set; }
        public long FY2023_24 { get; set; }
    }
}