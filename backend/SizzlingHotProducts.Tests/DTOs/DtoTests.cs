using FluentAssertions;
using SizzlingHotProducts.Api.DTOs;
using Xunit;

namespace SizzlingHotProducts.Tests.DTOs;

public class DtoTests
{
    [Fact]
    public void ProductDto_CanBeInstantiated()
    {
        // Act
        var dto = new ProductDto
        {
            Id = "P1",
            Name = "Product 1",
            Quantity = 10,
            ImageUrl = "http://example.com/image.jpg"
        };

        // Assert
        dto.Id.Should().Be("P1");
        dto.Name.Should().Be("Product 1");
        dto.Quantity.Should().Be(10);
        dto.ImageUrl.Should().Be("http://example.com/image.jpg");
    }

    [Fact]
    public void ProductSalesDto_CanBeInstantiated()
    {
        // Act
        var dto = new ProductSalesDto
        {
            ProductId = "P1",
            ProductName = "Product 1",
            QuantitySold = 10,
            ImageUrl = "http://example.com/image.jpg"
        };

        // Assert
        dto.ProductId.Should().Be("P1");
        dto.ProductName.Should().Be("Product 1");
        dto.QuantitySold.Should().Be(10);
    }

    [Fact]
    public void DailyTopProductDto_CanBeInstantiated()
    {
        var date = new DateTime(2026, 4, 23);

        // Act
        var dto = new DailyTopProductDto
        {
            ProductId = "P1",
            ProductName = "Top Product",
            QuantitySold = 100,
            Date = date,
            ImageUrl = "http://example.com/image.jpg"
        };

        // Assert
        dto.ProductId.Should().Be("P1");
        dto.ProductName.Should().Be("Top Product");
        dto.QuantitySold.Should().Be(100);
        dto.Date.Should().Be(date);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(100)]
    public void ProductDto_QuantityCanBeAnyNonNegativeValue(int quantity)
    {
        // Act
        var dto = new ProductDto { Quantity = quantity };

        // Assert
        dto.Quantity.Should().Be(quantity);
    }

    [Theory]
    [InlineData(2026, 1, 1)]
    [InlineData(2026, 12, 31)]
    [InlineData(2026, 6, 15)]
    public void DailyTopProductDto_DateValueIsPreserved(int year, int month, int day)
    {
        var date = new DateTime(year, month, day);

        // Act
        var dto = new DailyTopProductDto { Date = date };

        // Assert
        dto.Date.Should().Be(date);
    }
}
