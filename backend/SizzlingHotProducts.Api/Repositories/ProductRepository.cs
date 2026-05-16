using System.Text.Json;
using System.Text.Json.Serialization;
using SizzlingHotProducts.Api.Models;

namespace SizzlingHotProducts.Api.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly ILogger<ProductRepository> _logger;
    private readonly IWebHostEnvironment _environment;
    private readonly JsonSerializerOptions _jsonOptions;

    public ProductRepository(ILogger<ProductRepository> logger, IWebHostEnvironment environment)
    {
        _logger = logger;
        _environment = environment;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new JsonStringEnumConverter() }
        };
    }

    public async Task<IReadOnlyList<Order>> GetAllOrdersAsync()
    {
        var path = ResolveInputPath("orders.json");
        if (!File.Exists(path))
        {
            _logger.LogWarning("Orders file not found at {Path}", path);
            return Array.Empty<Order>();
        }

        await using var stream = File.OpenRead(path);
        var orders = await JsonSerializer.DeserializeAsync<List<Order>>(stream, _jsonOptions);
        return orders ?? new List<Order>();
    }

    public async Task<IReadOnlyList<Product>> GetAllProductsAsync()
    {
        var path = ResolveInputPath("products.json");
        if (!File.Exists(path))
        {
            _logger.LogWarning("Products file not found at {Path}", path);
            return Array.Empty<Product>();
        }

        await using var stream = File.OpenRead(path);
        var products = await JsonSerializer.DeserializeAsync<List<Product>>(stream, _jsonOptions);
        return products ?? new List<Product>();
    }

    private string ResolveInputPath(string fileName)
    {
        return Path.GetFullPath(Path.Combine(_environment.ContentRootPath, "inputs", fileName));
    }
}
