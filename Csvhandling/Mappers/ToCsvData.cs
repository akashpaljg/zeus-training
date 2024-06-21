using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Csvhandling.Models;

namespace Csvhandling.Mappers
{
    public static class CsvMapper
    {
        public static CsvModel ToCsvData(this string data)
        {
            var values = data.Split(',');
            // Console.WriteLine($"{values[0]} {values[1]} {values[2]} {values[3]} {values[4]} {values[5]} {values[6]} {values[7]} {values[8]} {values[9]}");
            return new CsvModel
            {
                Id = int.Parse(values[0]),
                EmailId = values[1],
                Name = values[2],
                Country = values[3],
                State = values[4],
                City = values[5],
                TelephoneNumber = values[6],
                AddressLine1 = values[7],
                AddressLine2 = values[8],
                DateOfBirth = DateTime.Parse(values[9]),
                FY2019_20 = long.Parse(values[10]),
                FY2020_21 = long.Parse(values[11]),
                FY2021_22 = long.Parse(values[12]),
                FY2022_23 = long.Parse(values[13]),
                FY2023_24 = long.Parse(values[14])
            };
        }
    }
}