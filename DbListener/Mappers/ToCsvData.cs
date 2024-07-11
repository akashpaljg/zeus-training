using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DbListener.Models;
using System.Text.RegularExpressions;

namespace DbListener.Mappers
{
    public static class ToCsvData
    {
        public static CsvModel ValidateModel(this CsvModel model)
        {
            Console.WriteLine("======= In Validator ====");
            Console.WriteLine(model.Id);
            return new CsvModel
            {
                Id = ValidateInt(model.Id, "Id"),
                EmailId = ValidateStringEmail(model.EmailId, "EmailId"),
                Name = ValidateString(model.Name, "Name"),
                Country = ValidateString(model.Country, "Country"),
                State = ValidateString(model.State, "State"),
                City = ValidateString(model.City, "City"),
                TelephoneNumber = ValidateTelephone(model.TelephoneNumber, "TelephoneNumber"),
                AddressLine1 = ValidateString(model.AddressLine1, "AddressLine1"),
                AddressLine2 = model.AddressLine2,
                DateOfBirth = ValidateDateTime(model.DateOfBirth, "DateOfBirth"),
                FY2019_20 = ValidateLong(model.FY2019_20, "FY2019_20"),
                FY2020_21 = ValidateLong(model.FY2020_21, "FY2020_21"),
                FY2021_22 = ValidateLong(model.FY2021_22, "FY2021_22"),
                FY2022_23 = ValidateLong(model.FY2022_23, "FY2022_23"),
                FY2023_24 = ValidateLong(model.FY2023_24, "FY2023_24")
            };
        }


        private static string ValidateStringEmail(string value, string fieldName)
        {
            if (string.IsNullOrEmpty(value))
            {
                throw new Exception($"Field '{fieldName}' cannot be null or empty.");
            }
            string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if (Regex.IsMatch(value, emailPattern))
            {
                return value;
            }
            throw new Exception($"Field '{fieldName}' has an invalid email format.");
        }



        private static string ValidateString(string value, string fieldName)
        {
            if (!string.IsNullOrEmpty(value))
            {
                return value;
            }
            throw new Exception($"Field '{fieldName}' cannot be null or empty.");
        }

        public static string ValidateTelephone(string value, string fieldName)
        {
            if (string.IsNullOrEmpty(value))
            {
                throw new Exception($"Field '{fieldName}' cannot be null or empty.");
            }

            var r = new Regex(@"^\(?([0-9]{3})\)?[- ]?([0-9]{3})[-.●]?([0-9]{4})$");
            if (r.IsMatch(value))
            {
                return value;
            }

            throw new Exception($"Field '{fieldName}' has an invalid TelephoneNumber.");
        }

        private static DateTime ValidateDateTime(DateTime value, string fieldName)
        {
            if (value > DateTime.MinValue)
            {
                return value;
            }
            throw new Exception($"Field '{fieldName}' has an invalid date.");
        }

        private static int ValidateInt(int value, string fieldName)
        {
            // Add any range validation or specific checks for integer if required
            return value;
        }

        private static long ValidateLong(long value, string fieldName)
        {
            // Add any range validation or specific checks for long if required
            return value;
        }
    }
}