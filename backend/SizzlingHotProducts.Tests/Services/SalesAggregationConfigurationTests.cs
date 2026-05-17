using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using SizzlingHotProducts.Api.Configuration;
using Xunit;

namespace SizzlingHotProducts.Tests.Services;

public class SalesAggregationConfigurationTests
{
    [Fact]
    public void ConfigureSalesAggregationOptions_BindsValuesFromConfigurationSection()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                [$"{SalesAggregationOptions.SectionName}:Mode"] = SalesAggregationMode.ByOrderCount.ToString(),
                [$"{SalesAggregationOptions.SectionName}:AccumulateSameCustomer"] = "true"
            })
            .Build();

        var services = new ServiceCollection();
        services.Configure<SalesAggregationOptions>(configuration.GetSection(SalesAggregationOptions.SectionName));

        using var provider = services.BuildServiceProvider();
        var options = provider.GetRequiredService<IOptions<SalesAggregationOptions>>().Value;

        options.Mode.Should().Be(SalesAggregationMode.ByOrderCount);
        options.AccumulateSameCustomer.Should().BeTrue();
    }
}