using SizzlingHotProducts.Api.Configuration;

namespace SizzlingHotProducts.Api.Services.Policies;

public class SalesAggregationPolicyFactory : ISalesAggregationPolicyFactory
{
    private static readonly ISalesAggregationPolicy ByItemQuantityPolicy = new ByItemQuantityAggregationPolicy();
    private static readonly ISalesAggregationPolicy ByOrderCountPolicy = new ByOrderCountAggregationPolicy();

    public ISalesAggregationPolicy Create(SalesAggregationOptions options)
    {
        return options.Mode switch
        {
            SalesAggregationMode.ByOrderCount => ByOrderCountPolicy,
            _ => ByItemQuantityPolicy
        };
    }
}
