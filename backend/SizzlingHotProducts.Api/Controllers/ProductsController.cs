using Microsoft.AspNetCore.Mvc;
using SizzlingHotProducts.Api.DTOs;
using SizzlingHotProducts.Api.Services;

namespace SizzlingHotProducts.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    private const int DefaultWindowDays = 3;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        DateTime start;
        DateTime end;

        if (startDate.HasValue && endDate.HasValue)
        {
            start = startDate.Value.Date;
            end = endDate.Value.Date;
        }
        else
        {
            var range = await _productService.GetDataDateRangeAsync();
            if (!range.HasValue)
            {
                return Ok(ApiResponse<List<ProductDto>>.Ok(new List<ProductDto>()));
            }

            end = range.Value.MaxDate.Date;
            start = end.AddDays(-(DefaultWindowDays - 1));
        }

        var ranking = await _productService.GetRetailProductSalesAsync(start, end);

        var products = ranking.Select(x => new ProductDto
        {
            Id = x.ProductId,
            Name = x.ProductName,
            Quantity = x.QuantitySold,
            ImageUrl = x.ImageUrl
        }).ToList();

        return Ok(ApiResponse<List<ProductDto>>.Ok(products));
    }

    [HttpGet("top-latest-window")]
    public async Task<IActionResult> GetTopLatestWindow([FromQuery] int days = DefaultWindowDays)
    {
        var top = await _productService.GetTopProductForLatestWindowAsync(days);
        var data = top is null ? new List<DailyTopProductDto>() : new List<DailyTopProductDto> { top };
        return Ok(ApiResponse<List<DailyTopProductDto>>.Ok(data));
    }

    [HttpGet("data-range")]
    public async Task<IActionResult> GetDataRange()
    {
        var range = await _productService.GetDataDateRangeAsync();
        if (!range.HasValue)
        {
            return Ok(ApiResponse<object?>.Ok(null));
        }

        return Ok(ApiResponse<object>.Ok(new
        {
            minDate = range.Value.MinDate.ToString("yyyy-MM-dd"),
            maxDate = range.Value.MaxDate.ToString("yyyy-MM-dd")
        }));
    }

    [HttpGet("daily-top")]
    public async Task<IActionResult> GetDailyTop([FromQuery] DateTime? date)
    {
        if (!date.HasValue)
        {
            return BadRequest(ApiResponse<object>.Fail("date query parameter is required."));
        }

        var top = await _productService.GetTopProductByDateAsync(date.Value.Date);
        var data = top is null ? new List<DailyTopProductDto>() : new List<DailyTopProductDto> { top };
        return Ok(ApiResponse<List<DailyTopProductDto>>.Ok(data));
    }
}
