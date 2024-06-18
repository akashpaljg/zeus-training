using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Csvhandling.Models;
using Microsoft.EntityFrameworkCore;


namespace Csvhandling.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
            
        }
        public DbSet<CsvModel> csvData {get;set;}
    }
}