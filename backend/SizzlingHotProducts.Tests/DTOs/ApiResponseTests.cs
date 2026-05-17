using FluentAssertions;
using SizzlingHotProducts.Api.DTOs;
using Xunit;

namespace SizzlingHotProducts.Tests.DTOs;

public class ApiResponseTests
{
    [Fact]
    public void ApiResponse_Ok_CreatesSuccessResponse()
    {
        // Act
        var response = ApiResponse<string>.Ok("test data");

        // Assert
        response.Success.Should().BeTrue();
        response.Data.Should().Be("test data");
        response.Error.Should().BeNull();
    }

    [Fact]
    public void ApiResponse_Fail_CreatesFailResponse()
    {
        // Act
        var response = ApiResponse<object>.Fail("error message");

        // Assert
        response.Success.Should().BeFalse();
        response.Error.Should().NotBeNull();
    }

    [Fact]
    public void ApiResponse_Fail_WithCodeAndMessage()
    {
        // Act
        var response = ApiResponse<object>.Fail("code123", "error message");

        // Assert
        response.Success.Should().BeFalse();
        response.Error.Should().NotBeNull();
    }

    [Fact]
    public void ApiResponse_Ok_WithList()
    {
        // Arrange
        var dataList = new List<string> { "item1", "item2", "item3" };

        // Act
        var response = ApiResponse<List<string>>.Ok(dataList);

        // Assert
        response.Success.Should().BeTrue();
        response.Data.Should().HaveCount(3);
        response.Data.Should().Contain("item1");
    }

    [Fact]
    public void ApiResponse_Ok_WithNull()
    {
        // Act
        var response = ApiResponse<object?>.Ok(null);

        // Assert
        response.Success.Should().BeTrue();
        response.Data.Should().BeNull();
    }

    [Fact]
    public void ApiResponse_MultipleInstances_AreIndependent()
    {
        // Act
        var response1 = ApiResponse<string>.Ok("data1");
        var response2 = ApiResponse<string>.Ok("data2");

        // Assert
        response1.Data.Should().Be("data1");
        response2.Data.Should().Be("data2");
        response1.Data.Should().NotBe(response2.Data);
    }

    [Theory]
    [InlineData("error1")]
    [InlineData("error2")]
    [InlineData("error3")]
    public void ApiResponse_Fail_WithVariousMessages(string errorMessage)
    {
        // Act
        var response = ApiResponse<object>.Fail(errorMessage);

        // Assert
        response.Success.Should().BeFalse();
        response.Error.Should().NotBeNull();
    }
}
