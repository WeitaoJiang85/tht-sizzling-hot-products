using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using SizzlingHotProducts.Api.Controllers;
using SizzlingHotProducts.Api.DTOs;
using SizzlingHotProducts.Api.Services;
using Xunit;

namespace SizzlingHotProducts.Tests.Controllers;

public class ProductsControllerTests
{
    private readonly Mock<IProductService> _serviceMock;
    private readonly ProductsController _controller;

    public ProductsControllerTests()
    {
        _serviceMock = new Mock<IProductService>();
        _controller = new ProductsController(_serviceMock.Object);
    }

    [Fact]
    public async Task GetProducts_UsesQueryRange_WhenStartAndEndProvided()
    {
        var start = new DateTime(2026, 4, 21);
        var end = new DateTime(2026, 4, 23);

        _serviceMock
            .Setup(s => s.GetRetailProductSalesAsync(start.Date, end.Date))
            .ReturnsAsync(new List<ProductSalesDto>
            {
                new() { ProductId = "P1", ProductName = "Prod 1", QuantitySold = 7, ImageUrl = "/img/p1.jpg" }
            });

        var result = await _controller.GetProducts(start, end);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<ApiResponse<List<ProductDto>>>().Subject;

        payload.Success.Should().BeTrue();
        payload.Data.Should().HaveCount(1);
        payload.Data![0].Id.Should().Be("P1");
        payload.Data[0].Quantity.Should().Be(7);
    }

    [Fact]
    public async Task GetProducts_ReturnsEmpty_WhenNoDataRange()
    {
        _serviceMock
            .Setup(s => s.GetDataDateRangeAsync())
            .ReturnsAsync(((DateTime MinDate, DateTime MaxDate)?)null);

        var result = await _controller.GetProducts(null, null);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<ApiResponse<List<ProductDto>>>().Subject;

        payload.Success.Should().BeTrue();
        payload.Data.Should().NotBeNull();
        payload.Data!.Should().BeEmpty();
    }

    [Fact]
    public async Task GetProducts_UsesLatestWindow_WhenNoQueryRange()
    {
        var latest = new DateTime(2026, 4, 25);
        var expectedStart = latest.AddDays(-2).Date;

        _serviceMock
            .Setup(s => s.GetDataDateRangeAsync())
            .ReturnsAsync((new DateTime(2026, 4, 20), latest));

        _serviceMock
            .Setup(s => s.GetRetailProductSalesAsync(expectedStart, latest.Date))
            .ReturnsAsync(new List<ProductSalesDto>
            {
                new() { ProductId = "P2", ProductName = "Prod 2", QuantitySold = 3 }
            });

        var result = await _controller.GetProducts(null, null);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<ApiResponse<List<ProductDto>>>().Subject;

        payload.Data.Should().HaveCount(1);
        payload.Data![0].Id.Should().Be("P2");
    }

    [Fact]
    public async Task GetTopLatestWindow_ReturnsEmpty_WhenServiceReturnsNull()
    {
        _serviceMock
            .Setup(s => s.GetTopProductForLatestWindowAsync(3))
            .ReturnsAsync((DailyTopProductDto?)null);

        var result = await _controller.GetTopLatestWindow();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<ApiResponse<List<DailyTopProductDto>>>().Subject;

        payload.Data.Should().NotBeNull();
        payload.Data!.Should().BeEmpty();
    }

    [Fact]
    public async Task GetTopLatestWindow_UsesCustomDays()
    {
        _serviceMock
            .Setup(s => s.GetTopProductForLatestWindowAsync(5))
            .ReturnsAsync(new DailyTopProductDto
            {
                ProductId = "P3",
                ProductName = "Prod 3",
                QuantitySold = 9,
                Date = new DateTime(2026, 4, 24)
            });

        var result = await _controller.GetTopLatestWindow(5);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<ApiResponse<List<DailyTopProductDto>>>().Subject;

        payload.Data.Should().HaveCount(1);
        payload.Data![0].ProductId.Should().Be("P3");
    }

    [Fact]
    public async Task GetDataRange_ReturnsNullPayload_WhenServiceReturnsNull()
    {
        _serviceMock
            .Setup(s => s.GetDataDateRangeAsync())
            .ReturnsAsync(((DateTime MinDate, DateTime MaxDate)?)null);

        var result = await _controller.GetDataRange();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<ApiResponse<object?>>().Subject;

        payload.Success.Should().BeTrue();
        payload.Data.Should().BeNull();
    }

    [Fact]
    public async Task GetDataRange_FormatsDates_AsIsoDate()
    {
        _serviceMock
            .Setup(s => s.GetDataDateRangeAsync())
            .ReturnsAsync((new DateTime(2026, 4, 1), new DateTime(2026, 4, 30)));

        var result = await _controller.GetDataRange();

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<ApiResponse<object>>().Subject;

        payload.Data.Should().NotBeNull();
        var json = System.Text.Json.JsonSerializer.Serialize(payload.Data);
        json.Should().Contain("2026-04-01");
        json.Should().Contain("2026-04-30");
    }

    [Fact]
    public async Task GetDailyTop_ReturnsBadRequest_WhenDateMissing()
    {
        var result = await _controller.GetDailyTop(null);

        var bad = result.Should().BeOfType<BadRequestObjectResult>().Subject;
        var payload = bad.Value.Should().BeOfType<ApiResponse<object>>().Subject;

        payload.Success.Should().BeFalse();
        payload.Error.Should().Be("date query parameter is required.");
    }

    [Fact]
    public async Task GetDailyTop_ReturnsItem_WhenServiceFindsTop()
    {
        var date = new DateTime(2026, 4, 23);
        _serviceMock
            .Setup(s => s.GetTopProductByDateAsync(date.Date))
            .ReturnsAsync(new DailyTopProductDto
            {
                Date = date,
                ProductId = "P1",
                ProductName = "Prod 1",
                QuantitySold = 10
            });

        var result = await _controller.GetDailyTop(date);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<ApiResponse<List<DailyTopProductDto>>>().Subject;

        payload.Data.Should().HaveCount(1);
        payload.Data![0].ProductId.Should().Be("P1");
    }

    [Fact]
    public async Task GetDailyTop_ReturnsEmpty_WhenServiceReturnsNull()
    {
        var date = new DateTime(2026, 4, 23);
        _serviceMock
            .Setup(s => s.GetTopProductByDateAsync(date.Date))
            .ReturnsAsync((DailyTopProductDto?)null);

        var result = await _controller.GetDailyTop(date);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var payload = ok.Value.Should().BeOfType<ApiResponse<List<DailyTopProductDto>>>().Subject;

        payload.Data.Should().NotBeNull();
        payload.Data!.Should().BeEmpty();
    }
}
