using FluentAssertions;
using Moq;
using SizzlingHotProducts.Api.Repositories;
using Xunit;

namespace SizzlingHotProducts.Tests.Repositories;

public class ProductRepositoryTests : IDisposable
{
    private readonly string _contentRoot;
    private readonly string _inputsDir;

    public ProductRepositoryTests()
    {
        _contentRoot = Path.Combine(Path.GetTempPath(), "SizzlingHotProducts.Tests", Guid.NewGuid().ToString("N"));
        _inputsDir = Path.Combine(_contentRoot, "inputs");
        Directory.CreateDirectory(_inputsDir);
    }

    [Fact]
    public async Task GetAllOrdersAsync_ReturnsEmpty_WhenFileMissing()
    {
        var repo = CreateRepository();

        var result = await repo.GetAllOrdersAsync();

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllProductsAsync_ReturnsEmpty_WhenFileMissing()
    {
        var repo = CreateRepository();

        var result = await repo.GetAllProductsAsync();

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllOrdersAsync_ParsesOrderData_FromJson()
    {
        File.WriteAllText(Path.Combine(_inputsDir, "orders.json"),
            """
            [
              {
                "orderId": "O1",
                "customerId": "C1",
                "date": "2026-04-21",
                "status": "Completed",
                "entries": [
                  { "id": "P1", "quantity": 2 },
                  { "id": "P2", "quantity": 1 }
                ]
              }
            ]
            """);

        var repo = CreateRepository();
        var result = await repo.GetAllOrdersAsync();

        result.Should().HaveCount(1);
        result[0].Id.Should().Be("O1");
        result[0].CustomerId.Should().Be("C1");
        result[0].Entries.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAllProductsAsync_ParsesProductData_FromJson()
    {
        File.WriteAllText(Path.Combine(_inputsDir, "products.json"),
            """
            [
              { "id": "P1", "name": "N1", "description": "D1", "price": 12.5, "imageUrl": "/img/1.jpg" },
              { "id": "P2", "name": "N2", "description": "D2", "price": 9.9, "imageUrl": null }
            ]
            """);

        var repo = CreateRepository();
        var result = await repo.GetAllProductsAsync();

        result.Should().HaveCount(2);
        result[0].Id.Should().Be("P1");
        result[1].Name.Should().Be("N2");
    }

    [Fact]
    public async Task GetAllOrdersAsync_ParsesEnumCaseInsensitive()
    {
        File.WriteAllText(Path.Combine(_inputsDir, "orders.json"),
            """
            [
              {
                "orderId": "O2",
                "customerId": "C2",
                "date": "21/04/2026",
                "status": "cancelled",
                "entries": []
              }
            ]
            """);

        var repo = CreateRepository();
        var result = await repo.GetAllOrdersAsync();

        result.Should().HaveCount(1);
        result[0].Status.Should().Be(SizzlingHotProducts.Api.Models.OrderStatus.Cancelled);
    }

    [Fact]
    public async Task GetAllOrdersAsync_ReturnsEmpty_WhenJsonIsNullLiteral()
    {
        File.WriteAllText(Path.Combine(_inputsDir, "orders.json"), "null");

        var repo = CreateRepository();
        var result = await repo.GetAllOrdersAsync();

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllProductsAsync_ReturnsEmpty_WhenJsonIsNullLiteral()
    {
        File.WriteAllText(Path.Combine(_inputsDir, "products.json"), "null");

        var repo = CreateRepository();
        var result = await repo.GetAllProductsAsync();

        result.Should().BeEmpty();
    }

    private ProductRepository CreateRepository()
    {
        var logger = new Mock<ILogger<ProductRepository>>();
        var env = new Mock<IWebHostEnvironment>();
        env.SetupGet(e => e.ContentRootPath).Returns(_contentRoot);
        return new ProductRepository(logger.Object, env.Object);
    }

    public void Dispose()
    {
        if (Directory.Exists(_contentRoot))
        {
            Directory.Delete(_contentRoot, true);
        }
    }
}
