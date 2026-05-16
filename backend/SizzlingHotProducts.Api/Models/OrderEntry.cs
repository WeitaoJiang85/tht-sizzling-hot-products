using System.Text.Json.Serialization;

namespace SizzlingHotProducts.Api.Models;

public class OrderEntry
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; } = 1;
}
