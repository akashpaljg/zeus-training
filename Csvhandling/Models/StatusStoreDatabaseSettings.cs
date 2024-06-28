namespace Csvhandling.Models;

public class StatusStoreDatabaseSettings
{
    public string ConnectionString { get; set; } = null!;

    public string DatabaseName { get; set; } = null!;

    public string StatusCollectionName { get; set; } = null!;
}