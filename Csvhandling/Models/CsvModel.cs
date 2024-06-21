using System;

namespace Csvhandling.Models
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

        // Add the UpdateFrom method here
        public void UpdateFrom(CsvModel model)
        {
            Name = model.Name;
            Country = model.Country;
            State = model.State;
            City = model.City;
            TelephoneNumber = model.TelephoneNumber;
            AddressLine1 = model.AddressLine1;
            AddressLine2 = model.AddressLine2;
            DateOfBirth = model.DateOfBirth;
            FY2019_20 = model.FY2019_20;
            FY2020_21 = model.FY2020_21;
            FY2021_22 = model.FY2021_22;
            FY2022_23 = model.FY2022_23;
            FY2023_24 = model.FY2023_24;
        }
    }
}
