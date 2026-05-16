using SizzlingHotProducts.Api.Models;

namespace SizzlingHotProducts.Api.Repositories;

public interface IProductRepository
{
    Task<IReadOnlyList<Order>> GetAllOrdersAsync();
    Task<IReadOnlyList<Product>> GetAllProductsAsync();
}
