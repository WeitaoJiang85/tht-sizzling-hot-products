using FluentAssertions;
using SizzlingHotProducts.Api.Configuration;
using SizzlingHotProducts.Api.Services.Policies;
using Xunit;

namespace SizzlingHotProducts.Tests.Services;

public class SalesAggregationPolicyFactoryTests
{
    [Fact]
    public void Create_ReturnsByItemQuantityPolicy_WhenConfigured()
    {
        var factory = new SalesAggregationPolicyFactory();

        var policy = factory.Create(new SalesAggregationOptions
        {
            Mode = SalesAggregationMode.ByItemQuantity
        });

        policy.Should().BeOfType<ByItemQuantityAggregationPolicy>();
    }

    [Fact]
    public void Create_ReturnsByOrderCountPolicy_WhenConfigured()
    {
        var factory = new SalesAggregationPolicyFactory();

        var policy = factory.Create(new SalesAggregationOptions
        {
            Mode = SalesAggregationMode.ByOrderCount
        });

        policy.Should().BeOfType<ByOrderCountAggregationPolicy>();
    }
}
