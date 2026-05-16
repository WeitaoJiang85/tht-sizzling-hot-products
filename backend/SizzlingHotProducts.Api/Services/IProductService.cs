using SizzlingHotProducts.Api.DTOs;

namespace SizzlingHotProducts.Api.Services;

public interface IProductService
{
    Task<DailyTopProductDto?> GetTopProductByDateAsync(DateTime date);
    Task<DailyTopProductDto?> GetTopProductByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<ProductSalesDto>> GetRetailProductSalesAsync(DateTime startDate, DateTime endDate);
    Task<DailyTopProductDto?> GetTopProductForLatestWindowAsync(int windowDays);
    Task<(DateTime MinDate, DateTime MaxDate)?> GetDataDateRangeAsync();
}
