using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Csvhandling.Mappers
{
    public class ToFileid
    {
        public string filePath { get; set; } = string.Empty;
        public int Id { get; set; }
        public ToFileid()
        {
            
        }

        public ToFileid(string filePath,int Id)
        {
            this.filePath = filePath;
            this.Id = Id;
        }
    }
}