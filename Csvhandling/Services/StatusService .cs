using Csvhandling.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace BookStoreApi.Services;

public class StatusService
{
    private readonly IMongoCollection<StatusModel> _booksCollection;

    public StatusService(
        IOptions<StatusStoreDatabaseSettings> bookStoreDatabaseSettings)
    {
            var mongoClient = new MongoClient(
            bookStoreDatabaseSettings.Value.ConnectionString);

             var mongoDatabase = mongoClient.GetDatabase(
            bookStoreDatabaseSettings.Value.DatabaseName);

        _booksCollection = mongoDatabase.GetCollection<StatusModel>(bookStoreDatabaseSettings.Value.StatusCollectionName);

    }

    public async Task<List<StatusModel>> GetAsync() =>
    
        await _booksCollection.Find(_ => true).ToListAsync();

    // public async Task<Book?> GetAsync(string id) =>
    //     await _booksCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    // public async Task CreateAsync(Book newBook) =>
    //     await _booksCollection.InsertOneAsync(newBook);

    // public async Task UpdateAsync(string id, Book updatedBook) =>
    //     await _booksCollection.ReplaceOneAsync(x => x.Id == id, updatedBook);

    // public async Task RemoveAsync(string id) =>
    //     await _booksCollection.DeleteOneAsync(x => x.Id == id);
}