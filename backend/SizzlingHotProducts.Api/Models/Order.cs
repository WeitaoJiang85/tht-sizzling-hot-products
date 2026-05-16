using System.Text.Json.Serialization;

namespace SizzlingHotProducts.Api.Models;

public class Order
{
    [JsonPropertyName("orderId")]
    public string Id { get; set; } = string.Empty;

    [JsonPropertyName("customerId")]
    public string CustomerId { get; set; } = string.Empty;

    [JsonPropertyName("date")]
    [JsonConverter(typeof(FlexibleDateJsonConverter))]
    public DateTime Date { get; set; }

    [JsonPropertyName("status")]
    public OrderStatus Status { get; set; }

    [JsonPropertyName("entries")]
    public List<OrderEntry> Entries { get; set; } = new();
}
