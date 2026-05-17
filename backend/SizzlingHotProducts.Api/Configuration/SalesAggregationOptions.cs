namespace SizzlingHotProducts.Api.Configuration;

public enum SalesAggregationMode
{
    ByItemQuantity = 0,
    ByOrderCount = 1
}

public class SalesAggregationOptions
{
    public const string SectionName = "SalesAggregation";

    // Task default: count one sale per order line context, not quantity.
    public SalesAggregationMode Mode { get; set; } = SalesAggregationMode.ByOrderCount;

    // Task default: same customer + same product + same day should only count once.
    public bool AccumulateSameCustomer { get; set; } = false;
}
