using SizzlingHotProducts.Api.DTOs;
using SizzlingHotProducts.Api.Models;

namespace SizzlingHotProducts.Api.Services.Policies;

public class ByItemQuantityAggregationPolicy : ISalesAggregationPolicy
{
    public IEnumerable<ProductSalesDto> Aggregate(
        IEnumerable<Order> orders,
        IReadOnlyDictionary<string, Product> productDict,
        DateTime startDate,
        DateTime endDate,
        bool accumulateSameCustomer)
    {
        var scopedLines = orders
            .Where(o => o.Date.Date >= startDate.Date && o.Date.Date <= endDate.Date)
            .SelectMany(o => o.Entries.Select(e => new
            {
                ProductId = e.Id,
                Quantity = e.Quantity,
                o.CustomerId,
                Day = o.Date.Date,
                o.Id
            }))
            .Where(x => productDict.ContainsKey(x.ProductId))
            .OrderBy(x => x.Day)
            .ThenBy(x => x.Id)
            .ToList();

        if (!accumulateSameCustomer)
        {
            scopedLines = scopedLines
                .GroupBy(x => new { x.ProductId, x.CustomerId, x.Day })
                .Select(g => g.First())
                .ToList();
        }

        return scopedLines
            .GroupBy(x => x.ProductId)
            .Select(group => new ProductSalesDto
            {
                ProductId = group.Key,
                ProductName = productDict[group.Key].Name,
                QuantitySold = group.Sum(x => x.Quantity),
                ImageUrl = productDict[group.Key].ImageUrl
            })
            .OrderByDescending(x => x.QuantitySold)
            .ThenBy(x => x.ProductName)
            .ToList();
    }
}
