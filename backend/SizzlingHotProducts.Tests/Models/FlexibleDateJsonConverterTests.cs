using FluentAssertions;
using System.Text.Json;
using System.Text.Json.Serialization;
using SizzlingHotProducts.Api.Models;
using Xunit;

namespace SizzlingHotProducts.Tests.Models;

public class FlexibleDateJsonConverterTests
{
    private sealed class DateHolder
    {
        [JsonPropertyName("date")]
        public DateTime Date { get; set; }
    }

    private static readonly JsonSerializerOptions Options = new()
    {
        Converters = { new FlexibleDateJsonConverter() }
    };

    [Theory]
    [InlineData("2026-04-21")]
    [InlineData("21/04/2026")]
    [InlineData("1/4/2026")]
    [InlineData("2026-04-21T13:20:00")]
    public void Read_AcceptsSupportedFormats(string raw)
    {
        var json = "{\"date\":\"" + raw + "\"}";

        var result = JsonSerializer.Deserialize<DateHolder>(json, Options);

        result.Should().NotBeNull();
        result!.Date.Year.Should().Be(2026);
    }

    [Fact]
    public void Read_Throws_WhenTokenIsNotString()
    {
        var json = "{\"date\":123}";

        var act = () => JsonSerializer.Deserialize<DateHolder>(json, Options);

        act.Should().Throw<JsonException>();
    }

    [Fact]
    public void Read_Throws_WhenDateStringIsEmpty()
    {
        var json = "{\"date\":\"\"}";

        var act = () => JsonSerializer.Deserialize<DateHolder>(json, Options);

        act.Should().Throw<JsonException>();
    }

    [Fact]
    public void Read_Throws_WhenDateFormatUnsupported()
    {
        var json = "{\"date\":\"not-a-date\"}";

        var act = () => JsonSerializer.Deserialize<DateHolder>(json, Options);

        act.Should().Throw<JsonException>();
    }

    [Fact]
    public void Write_FormatsAsIsoDate()
    {
        var payload = new DateHolder { Date = new DateTime(2026, 4, 21, 8, 30, 0) };

        var json = JsonSerializer.Serialize(payload, Options);

        json.Should().Contain("2026-04-21");
        json.Should().NotContain("08:30:00");
    }
}
