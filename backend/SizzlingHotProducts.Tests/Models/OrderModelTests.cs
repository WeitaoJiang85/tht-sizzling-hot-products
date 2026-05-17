using FluentAssertions;
using SizzlingHotProducts.Api.Models;
using Xunit;

namespace SizzlingHotProducts.Tests.Models;

public class OrderModelTests
{
    [Fact]
    public void Order_CanBeInstantiated()
    {
        // Act
        var order = new Order
        {
            Id = "O1",
            CustomerId = "C1",
            Date = new DateTime(2026, 4, 21),
            Status = OrderStatus.Completed,
            Entries = new List<OrderEntry>()
        };

        // Assert
        order.Id.Should().Be("O1");
        order.CustomerId.Should().Be("C1");
        order.Date.Should().Be(new DateTime(2026, 4, 21));
        order.Status.Should().Be(OrderStatus.Completed);
    }

    [Fact]
    public void OrderEntry_CanBeInstantiated()
    {
        // Act
        var entry = new OrderEntry { Id = "P1", Quantity = 5 };

        // Assert
        entry.Id.Should().Be("P1");
        entry.Quantity.Should().Be(5);
    }

    [Fact]
    public void Product_CanBeInstantiated()
    {
        // Act
        var product = new Product { Id = "P1", Name = "Test Product" };

        // Assert
        product.Id.Should().Be("P1");
        product.Name.Should().Be("Test Product");
    }

    [Fact]
    public void Order_WithMultipleEntries()
    {
        // Act
        var order = new Order
        {
            Id = "O1",
            Entries = new List<OrderEntry>
            {
                new() { Id = "P1", Quantity = 5 },
                new() { Id = "P2", Quantity = 3 }
            }
        };

        // Assert
        order.Entries.Should().HaveCount(2);
    }

    [Theory]
    [InlineData(OrderStatus.Completed)]
    [InlineData(OrderStatus.Cancelled)]
    public void Order_StatusCanBeBothValues(OrderStatus status)
    {
        // Act
        var order = new Order { Status = status };

        // Assert
        order.Status.Should().Be(status);
    }
}
