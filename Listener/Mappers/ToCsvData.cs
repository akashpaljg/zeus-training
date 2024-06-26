using Listener.Models;
using System.Text.RegularExpressions;

namespace Listener.Mappers
{
    public static class CsvMapper
    {
        public static CsvModel ToCsvData(this string data)
        {
            var values = data.Split(',');

            if(values.Length < 15){
                throw new Exception("Not enough data is sent");
            }
            
            return new CsvModel
            {
                Id = ValidateInt(values[0],"Id"),
                EmailId = ValidateStringEmail(values[1],"EmailId"),
                Name = ValidateString(values[2],"Name"),
                Country = ValidateString(values[3],"Country"),
                State = ValidateString(values[4],"State"),
                City = ValidateString(values[5],"City"),
                TelephoneNumber = ValidateString(values[6],"TelephoneNumber"),
                AddressLine1 = ValidateString(values[7],"AddressLine1"),
                AddressLine2 = values[8],
                DateOfBirth = ValidateDateTime(values[9],"DateTime"),
                FY2019_20 = ValidateLong(values[10],"FY2019_20"),
                FY2020_21 = ValidateLong(values[11],"FY2020_21"),
                FY2021_22 = ValidateLong(values[12],"FY2021_22"),
                FY2022_23 = ValidateLong(values[13],"FY2022_23"),
                FY2023_24 = ValidateLong(values[14],"FY2023_24")
            };
        }

        private static string ValidateStringEmail(string v1, string v2)
        {
            if(string.IsNullOrEmpty(v1)){
                throw new Exception($"Error at parsing int {v1} of feild: {v2}");
            }
            string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
            if(Regex.IsMatch(v1,emailPattern)){
                return v1;
            }
            throw new Exception($"Error at parsing int {v1} of feild: {v2}");
        }

        private static string ValidateString(string v1, string v2)
        {
            if(!string.IsNullOrEmpty(v1)){
                return v1;
            }
            throw new Exception($"Error at parsing int {v1} of feild: {v2}");
        }

        private static DateTime ValidateDateTime(string v1, string v2)
        {
            if(DateTime.TryParse(v1,out DateTime result)){
                return result;
            }
            throw new Exception($"Error at parsing int {v1} of feild: {v2}");
        }

        private static int ValidateInt(string v1, string v2)
        {
            if(int.TryParse(v1,out int result)){
                return result;
            }
            throw new Exception($"Error at parsing int {v1} of feild: {v2}");
        }
        private static long ValidateLong(string v1, string v2)
        {
            if(long.TryParse(v1,out long result)){
                return result;
            }
            throw new Exception($"Error at parsing long {v1} of feild: {v2}");
        }
    }
}