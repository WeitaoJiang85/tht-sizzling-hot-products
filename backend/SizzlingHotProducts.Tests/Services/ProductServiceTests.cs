using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using SizzlingHotProducts.Api.Models;
using SizzlingHotProducts.Api.Repositories;
using SizzlingHotProducts.Api.Services;
using Xunit;

namespace SizzlingHotProducts.Tests.Services;

public class ProductServiceTests
{
    private readonly Mock<IProductRepository> _mockRepository;
    private readonly ProductService _service;

    public ProductServiceTests()
    {
        _mockRepository = new Mock<IProductRepository>();
        var mockLogger = new Mock<ILogger<ProductService>>();
        _service = new ProductService(_mockRepository.Object, mockLogger.Object);
    }

    [Fact]
    public async Task GetTopProductByDateAsync_SumsQuantitiesForTargetDate()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry>
                {
                    new() { Id = "P1", Quantity = 2 },
                    new() { Id = "P2", Quantity = 1 }
                }
            },
            new Order
            {
                Id = "O2",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 3 } }
            }
        };

        SetupProductsAndOrders(orders);

        var result = await _service.GetTopProductByDateAsync(new DateTime(2026, 4, 21));

        result.Should().NotBeNull();
        result!.ProductId.Should().Be("P1");
        result.QuantitySold.Should().Be(5);
    }

    [Fact]
    public async Task GetTopProductByDateAsync_FallsBackToLatestDateWhenTargetDateHasNoData()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O10",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P2", Quantity = 1 } }
            },
            new Order
            {
                Id = "O11",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 23),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 4 } }
            }
        };

        SetupProductsAndOrders(orders);

        var result = await _service.GetTopProductByDateAsync(new DateTime(2026, 4, 25));

        result.Should().NotBeNull();
        result!.ProductId.Should().Be("P1");
        result.Date.Should().Be(new DateTime(2026, 4, 23));
        result.QuantitySold.Should().Be(4);
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_ExcludesCancelledOrderIdsAcrossDays()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 2 }, new() { Id = "P2", Quantity = 1 } }
            },
            new Order
            {
                Id = "O2",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 22),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 3 } }
            },
            new Order
            {
                Id = "O2",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 23),
                Status = OrderStatus.Cancelled,
                Entries = new List<OrderEntry>()
            }
        };

        SetupProductsAndOrders(orders);

        var result = (await _service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 23))).ToList();

        result.Should().HaveCount(2);
        result.Should().ContainSingle(x => x.ProductId == "P1" && x.QuantitySold == 2);
        result.Should().ContainSingle(x => x.ProductId == "P2" && x.QuantitySold == 1);
    }

    [Fact]
    public async Task GetTopProductForLatestWindowAsync_UsesLatestThreeDays()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O100",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 20),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P2", Quantity = 10 } }
            },
            new Order
            {
                Id = "O101",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 2 } }
            },
            new Order
            {
                Id = "O102",
                CustomerId = "C3",
                Date = new DateTime(2026, 4, 22),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 3 } }
            },
            new Order
            {
                Id = "O103",
                CustomerId = "C4",
                Date = new DateTime(2026, 4, 23),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P2", Quantity = 1 } }
            }
        };

        SetupProductsAndOrders(orders);

        var result = await _service.GetTopProductForLatestWindowAsync(3);

        result.Should().NotBeNull();
        result!.ProductId.Should().Be("P1");
        result.QuantitySold.Should().Be(5);
    }

    [Fact]
    public async Task GetDataDateRangeAsync_ReturnsMinAndMaxFromActiveCompletedOrders()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O200",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 1 } }
            },
            new Order
            {
                Id = "O201",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 24),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P2", Quantity = 1 } }
            },
            new Order
            {
                Id = "O201",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 25),
                Status = OrderStatus.Cancelled,
                Entries = new List<OrderEntry>()
            }
        };

        SetupProductsAndOrders(orders);

        var result = await _service.GetDataDateRangeAsync();

        result.Should().NotBeNull();
        result!.Value.MinDate.Should().Be(new DateTime(2026, 4, 21));
        result.Value.MaxDate.Should().Be(new DateTime(2026, 4, 21));
    }

    private void SetupProductsAndOrders(IEnumerable<Order> orders)
    {
        IReadOnlyList<Product> products = new List<Product>
        {
            new Product { Id = "P1", Name = "Ezy Storage 37L Flexi Laundry Basket - White" },
            new Product { Id = "P2", Name = "Aandleford Black Seaford Post Mounted Letterbox" }
        };

        IReadOnlyList<Order> orderList = orders.ToList();

        _mockRepository.Setup(r => r.GetAllProductsAsync()).ReturnsAsync(products);
        _mockRepository.Setup(r => r.GetAllOrdersAsync()).ReturnsAsync(orderList);
    }
}
