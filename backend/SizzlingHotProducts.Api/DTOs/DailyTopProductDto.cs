namespace SizzlingHotProducts.Api.DTOs;

public class DailyTopProductDto
{
    public DateTime Date { get; set; }
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public int QuantitySold { get; set; }

    public string? ImageUrl { get; set; }
}
