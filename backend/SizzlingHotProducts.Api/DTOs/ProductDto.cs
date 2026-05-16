namespace SizzlingHotProducts.Api.DTOs;

public class ProductDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string? ImageUrl { get; set; }
}
