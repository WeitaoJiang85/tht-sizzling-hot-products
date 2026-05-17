using SizzlingHotProducts.Api.Configuration;

namespace SizzlingHotProducts.Api.Services.Policies;

public interface ISalesAggregationPolicyFactory
{
    ISalesAggregationPolicy Create(SalesAggregationOptions options);
}
