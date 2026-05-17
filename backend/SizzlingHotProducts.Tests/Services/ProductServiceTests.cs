using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using SizzlingHotProducts.Api.Configuration;
using SizzlingHotProducts.Api.Models;
using SizzlingHotProducts.Api.Repositories;
using SizzlingHotProducts.Api.Services;
using SizzlingHotProducts.Api.Services.Policies;
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
        _service = new ProductService(
            _mockRepository.Object,
            mockLogger.Object,
            Options.Create(new SalesAggregationOptions
            {
                Mode = SalesAggregationMode.ByItemQuantity,
                AccumulateSameCustomer = true
            }),
            new SalesAggregationPolicyFactory());
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

    [Fact]
    public async Task GetRetailProductSalesAsync_HandlesEmptyOrderEntries()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry>()
            }
        };

        SetupProductsAndOrders(orders);

        var result = await _service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21));

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_FiltersByDateRange()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 20),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 5 } }
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
                Id = "O3",
                CustomerId = "C3",
                Date = new DateTime(2026, 4, 25),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 2 } }
            }
        };

        SetupProductsAndOrders(orders);

        var result = (await _service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 23))).ToList();

        result.Should().HaveCount(1);
        result[0].QuantitySold.Should().Be(3);
    }

    [Fact]
    public async Task GetTopProductByDateAsync_ReturnsNullWhenNoOrders()
    {
        var orders = Array.Empty<Order>();
        SetupProductsAndOrders(orders);

        var result = await _service.GetTopProductByDateAsync(new DateTime(2026, 4, 21));

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTopProductForLatestWindowAsync_HandlesMultipleCancelledOrders()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 5 } }
            },
            new Order
            {
                Id = "O2",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 22),
                Status = OrderStatus.Cancelled,
                Entries = new List<OrderEntry> { new() { Id = "P2", Quantity = 100 } }
            },
            new Order
            {
                Id = "O3",
                CustomerId = "C3",
                Date = new DateTime(2026, 4, 23),
                Status = OrderStatus.Cancelled,
                Entries = new List<OrderEntry> { new() { Id = "P3", Quantity = 200 } }
            }
        };

        SetupProductsAndOrders(orders);

        var result = await _service.GetTopProductForLatestWindowAsync(3);

        result.Should().NotBeNull();
        result!.ProductId.Should().Be("P1");
        result.QuantitySold.Should().Be(5);
    }

    [Fact]
    public async Task GetDataDateRangeAsync_ReturnsNullWhenNoCompletedOrders()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Cancelled,
                Entries = new List<OrderEntry>()
            }
        };

        SetupProductsAndOrders(orders);

        var result = await _service.GetDataDateRangeAsync();

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_AggregatesSameProductAcrossMultipleOrders()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 2 } }
            },
            new Order
            {
                Id = "O2",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 3 } }
            },
            new Order
            {
                Id = "O3",
                CustomerId = "C3",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 1 } }
            }
        };

        SetupProductsAndOrders(orders);

        var result = (await _service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21))).ToList();

        result.Should().HaveCount(1);
        result[0].ProductId.Should().Be("P1");
        result[0].QuantitySold.Should().Be(6);
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_HandlesProductsWithoutOrderEntries()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry>()
            },
            new Order
            {
                Id = "O2",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 5 } }
            }
        };

        SetupProductsAndOrders(orders);

        var result = (await _service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21))).ToList();

        result.Should().HaveCount(1);
        result[0].ProductId.Should().Be("P1");
    }

    [Fact]
    public async Task GetTopProductForLatestWindowAsync_ReturnsNullWhenNoCompletedOrders()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Cancelled,
                Entries = new List<OrderEntry>()
            }
        };

        SetupProductsAndOrders(orders);

        var result = await _service.GetTopProductForLatestWindowAsync(3);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTopProductByDateRangeAsync_ThrowsWhenStartAfterEnd()
    {
        var act = async () => await _service.GetTopProductByDateRangeAsync(
            new DateTime(2026, 4, 24),
            new DateTime(2026, 4, 23));

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_ThrowsWhenStartAfterEnd()
    {
        var act = async () => await _service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 24),
            new DateTime(2026, 4, 23));

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task GetTopProductForLatestWindowAsync_ThrowsWhenWindowDaysInvalid()
    {
        var act = async () => await _service.GetTopProductForLatestWindowAsync(0);

        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task GetTopProductByDateRangeAsync_PrefersAlphabeticalName_WhenQuantitiesTie()
    {
        var orders = new[]
        {
            new Order
            {
                Id = "T1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry>
                {
                    new() { Id = "P1", Quantity = 5 },
                    new() { Id = "P2", Quantity = 5 }
                }
            }
        };

        SetupProductsAndOrders(orders);

        var result = await _service.GetTopProductByDateRangeAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21));

        result.Should().NotBeNull();
        result!.ProductId.Should().Be("P2");
        result.QuantitySold.Should().Be(5);
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_GeneratesBrandingImage_WhenImageMissing()
    {
        IReadOnlyList<Product> products = new List<Product>
        {
            new Product { Id = "P100", Name = "My Fancy Product", ImageUrl = null }
        };

        IReadOnlyList<Order> orders = new List<Order>
        {
            new Order
            {
                Id = "IMG1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P100", Quantity = 1 } }
            }
        };

        _mockRepository.Setup(r => r.GetAllProductsAsync()).ReturnsAsync(products);
        _mockRepository.Setup(r => r.GetAllOrdersAsync()).ReturnsAsync(orders);

        var result = (await _service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21))).Single();

        result.ImageUrl.Should().Be("/branding/My%20Fancy%20Product.jpg");
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_EncodesProvidedImagePath()
    {
        IReadOnlyList<Product> products = new List<Product>
        {
            new Product { Id = "P200", Name = "N", ImageUrl = "/images/my pic.jpg" }
        };

        IReadOnlyList<Order> orders = new List<Order>
        {
            new Order
            {
                Id = "IMG2",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P200", Quantity = 2 } }
            }
        };

        _mockRepository.Setup(r => r.GetAllProductsAsync()).ReturnsAsync(products);
        _mockRepository.Setup(r => r.GetAllOrdersAsync()).ReturnsAsync(orders);

        var result = (await _service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21))).Single();

        result.ImageUrl.Should().Be("/images/my%20pic.jpg");
    }

    [Fact]
    public async Task GetTopProductByDateAsync_ReturnsNull_WhenNoEntriesMatchKnownProducts()
    {
        IReadOnlyList<Product> products = new List<Product>
        {
            new Product { Id = "P1", Name = "Known" }
        };

        IReadOnlyList<Order> orders = new List<Order>
        {
            new Order
            {
                Id = "UNK1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "UNKNOWN", Quantity = 5 } }
            }
        };

        _mockRepository.Setup(r => r.GetAllProductsAsync()).ReturnsAsync(products);
        _mockRepository.Setup(r => r.GetAllOrdersAsync()).ReturnsAsync(orders);

        var result = await _service.GetTopProductByDateAsync(new DateTime(2026, 4, 21));

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTopProductByDateRangeAsync_ReturnsNull_WhenNoEntriesMatchKnownProducts()
    {
        IReadOnlyList<Product> products = new List<Product>
        {
            new Product { Id = "P1", Name = "Known" }
        };

        IReadOnlyList<Order> orders = new List<Order>
        {
            new Order
            {
                Id = "UNK2",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "UNKNOWN", Quantity = 2 } }
            }
        };

        _mockRepository.Setup(r => r.GetAllProductsAsync()).ReturnsAsync(products);
        _mockRepository.Setup(r => r.GetAllOrdersAsync()).ReturnsAsync(orders);

        var result = await _service.GetTopProductByDateRangeAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21));

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTopProductByDateRangeAsync_ReturnsNull_WhenNoOrders()
    {
        _mockRepository.Setup(r => r.GetAllProductsAsync()).ReturnsAsync(new List<Product>
        {
            new() { Id = "P1", Name = "Known" }
        });
        _mockRepository.Setup(r => r.GetAllOrdersAsync()).ReturnsAsync(Array.Empty<Order>());

        var result = await _service.GetTopProductByDateRangeAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21));

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetTopProductByDateAsync_Throws_WhenRepositoryFails()
    {
        _mockRepository
            .Setup(r => r.GetAllOrdersAsync())
            .ThrowsAsync(new InvalidOperationException("boom-date"));

        var act = async () => await _service.GetTopProductByDateAsync(new DateTime(2026, 4, 21));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task GetTopProductByDateRangeAsync_Throws_WhenRepositoryFails()
    {
        _mockRepository
            .Setup(r => r.GetAllOrdersAsync())
            .ThrowsAsync(new InvalidOperationException("boom-range"));

        var act = async () => await _service.GetTopProductByDateRangeAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 22));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_Throws_WhenRepositoryFails()
    {
        _mockRepository
            .Setup(r => r.GetAllOrdersAsync())
            .ThrowsAsync(new InvalidOperationException("boom-retail"));

        var act = async () => await _service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 22));

        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task GetTopProductByDateAsync_ReturnsNull_WhenTopProductIdIsEmpty()
    {
        IReadOnlyList<Product> products = new List<Product>
        {
            new Product { Id = string.Empty, Name = "EmptyId" }
        };

        IReadOnlyList<Order> orders = new List<Order>
        {
            new Order
            {
                Id = "EMP1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = string.Empty, Quantity = 1 } }
            }
        };

        _mockRepository.Setup(r => r.GetAllProductsAsync()).ReturnsAsync(products);
        _mockRepository.Setup(r => r.GetAllOrdersAsync()).ReturnsAsync(orders);

        var result = await _service.GetTopProductByDateAsync(new DateTime(2026, 4, 21));

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_UsesOrderCountMode_WhenConfigured()
    {
        var repository = new Mock<IProductRepository>();
        var service = CreateServiceWithOptions(
            repository,
            new SalesAggregationOptions
            {
                Mode = SalesAggregationMode.ByOrderCount,
                AccumulateSameCustomer = true
            });

        repository.Setup(r => r.GetAllProductsAsync()).ReturnsAsync(new List<Product>
        {
            new() { Id = "P1", Name = "Prod1" }
        });

        repository.Setup(r => r.GetAllOrdersAsync()).ReturnsAsync(new List<Order>
        {
            new()
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 5 } }
            },
            new()
            {
                Id = "O2",
                CustomerId = "C2",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 2 } }
            }
        });

        var result = (await service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21))).Single();

        result.QuantitySold.Should().Be(2);
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_DisablesSameCustomerAccumulation_WhenConfigured()
    {
        var repository = new Mock<IProductRepository>();
        var service = CreateServiceWithOptions(
            repository,
            new SalesAggregationOptions
            {
                Mode = SalesAggregationMode.ByItemQuantity,
                AccumulateSameCustomer = false
            });

        repository.Setup(r => r.GetAllProductsAsync()).ReturnsAsync(new List<Product>
        {
            new() { Id = "P1", Name = "Prod1" }
        });

        repository.Setup(r => r.GetAllOrdersAsync()).ReturnsAsync(new List<Order>
        {
            new()
            {
                Id = "O1",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 2 } }
            },
            new()
            {
                Id = "O2",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 3 } }
            }
        });

        var result = (await service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21))).Single();

        result.QuantitySold.Should().Be(2);
    }

    [Fact]
    public async Task GetRetailProductSalesAsync_UsesTaskDefaultRules_WhenUsingDefaultConstructor()
    {
        var repository = new Mock<IProductRepository>();
        var logger = new Mock<ILogger<ProductService>>();
        var service = new ProductService(repository.Object, logger.Object);

        repository.Setup(r => r.GetAllProductsAsync()).ReturnsAsync(new List<Product>
        {
            new() { Id = "P1", Name = "Hammer" }
        });

        repository.Setup(r => r.GetAllOrdersAsync()).ReturnsAsync(new List<Order>
        {
            new()
            {
                Id = "O10",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 2 } }
            },
            new()
            {
                Id = "O11",
                CustomerId = "C1",
                Date = new DateTime(2026, 4, 21),
                Status = OrderStatus.Completed,
                Entries = new List<OrderEntry> { new() { Id = "P1", Quantity = 3 } }
            }
        });

        var result = (await service.GetRetailProductSalesAsync(
            new DateTime(2026, 4, 21),
            new DateTime(2026, 4, 21))).Single();

        result.QuantitySold.Should().Be(1);
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

    private static ProductService CreateServiceWithOptions(
        Mock<IProductRepository> repository,
        SalesAggregationOptions options)
    {
        var logger = new Mock<ILogger<ProductService>>();
        return new ProductService(
            repository.Object,
            logger.Object,
            Options.Create(options),
            new SalesAggregationPolicyFactory());
    }
}
