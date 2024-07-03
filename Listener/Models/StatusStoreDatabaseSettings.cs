using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Listener.Models
{
    public class StatusStoreDatabaseSettings
    {
    public string ConnectionString { get; set; } = null!;

    public string DatabaseName { get; set; } = null!;

    public string StatusCollectionName { get; set; } = null!;
    }
}