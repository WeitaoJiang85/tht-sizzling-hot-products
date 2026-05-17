using SizzlingHotProducts.Api.DTOs;
using SizzlingHotProducts.Api.Models;

namespace SizzlingHotProducts.Api.Services.Policies;

public interface ISalesAggregationPolicy
{
    IEnumerable<ProductSalesDto> Aggregate(
        IEnumerable<Order> orders,
        IReadOnlyDictionary<string, Product> productDict,
        DateTime startDate,
        DateTime endDate,
        bool accumulateSameCustomer);
}
