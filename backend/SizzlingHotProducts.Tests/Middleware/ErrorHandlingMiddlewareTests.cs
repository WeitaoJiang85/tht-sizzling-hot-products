using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Moq;
using SizzlingHotProducts.Api;
using SizzlingHotProducts.Api.DTOs;
using System.Net;
using System.Text.Json;
using Xunit;

namespace SizzlingHotProducts.Tests.Middleware;

public class ErrorHandlingMiddlewareTests
{
    [Fact]
    public async Task InvokeAsync_CallsNextWhenNoException()
    {
        // Arrange
        var context = new DefaultHttpContext();
        var nextCalled = false;

        RequestDelegate next = (HttpContext ctx) =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var loggerMock = new Mock<ILogger<ErrorHandlingMiddleware>>();
        var middleware = new ErrorHandlingMiddleware(next, loggerMock.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        nextCalled.Should().BeTrue();
    }

    [Fact]
    public async Task InvokeAsync_ReturnsInternalServerErrorWhenExceptionThrown()
    {
        // Arrange
        var context = new DefaultHttpContext();
        var exception = new Exception("Test error");

        RequestDelegate next = (HttpContext ctx) => throw exception;

        var loggerMock = new Mock<ILogger<ErrorHandlingMiddleware>>();
        var middleware = new ErrorHandlingMiddleware(next, loggerMock.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
    }

    [Fact]
    public async Task InvokeAsync_SetsJsonContentType()
    {
        // Arrange
        var context = new DefaultHttpContext();

        RequestDelegate next = (HttpContext ctx) => throw new Exception("Test");

        var loggerMock = new Mock<ILogger<ErrorHandlingMiddleware>>();
        var middleware = new ErrorHandlingMiddleware(next, loggerMock.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.ContentType.Should().Be("application/json");
    }

    [Fact]
    public async Task InvokeAsync_WritesErrorResponseToBody()
    {
        // Arrange
        var context = new DefaultHttpContext();
        var ms = new MemoryStream();
        context.Response.Body = ms;

        RequestDelegate next = (HttpContext ctx) => throw new Exception("Test error");

        var loggerMock = new Mock<ILogger<ErrorHandlingMiddleware>>();
        var middleware = new ErrorHandlingMiddleware(next, loggerMock.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        ms.Position = 0;
        using var reader = new StreamReader(ms);
        var response = reader.ReadToEnd();
        response.Should().NotBeEmpty();
        response.Should().Contain("InternalServerError");
    }

    [Fact]
    public async Task InvokeAsync_LogsExceptionWhenThrown()
    {
        // Arrange
        var context = new DefaultHttpContext();
        var exception = new InvalidOperationException("Test error");

        RequestDelegate next = (HttpContext ctx) => throw exception;

        var loggerMock = new Mock<ILogger<ErrorHandlingMiddleware>>();
        var middleware = new ErrorHandlingMiddleware(next, loggerMock.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.IsAny<It.IsAnyType>(),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_IncludesExceptionMessageInResponse()
    {
        // Arrange
        var context = new DefaultHttpContext();
        var ms = new MemoryStream();
        context.Response.Body = ms;
        var errorMessage = "This is a test error message";

        RequestDelegate next = (HttpContext ctx) => throw new Exception(errorMessage);

        var loggerMock = new Mock<ILogger<ErrorHandlingMiddleware>>();
        var middleware = new ErrorHandlingMiddleware(next, loggerMock.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        ms.Position = 0;
        using var reader = new StreamReader(ms);
        var response = reader.ReadToEnd();
        response.Should().Contain(errorMessage);
    }

    [Fact]
    public async Task InvokeAsync_ReturnsProperApiResponseFormat()
    {
        // Arrange
        var context = new DefaultHttpContext();
        var ms = new MemoryStream();
        context.Response.Body = ms;

        RequestDelegate next = (HttpContext ctx) => throw new Exception("Test");

        var loggerMock = new Mock<ILogger<ErrorHandlingMiddleware>>();
        var middleware = new ErrorHandlingMiddleware(next, loggerMock.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        ms.Position = 0;
        using var reader = new StreamReader(ms);
        var json = reader.ReadToEnd();

        var apiResponse = JsonSerializer.Deserialize<ApiResponse<object>>(json);
        apiResponse.Should().NotBeNull();
        apiResponse!.Success.Should().BeFalse();
    }

    [Fact]
    public async Task InvokeAsync_HandlesNullException()
    {
        // Arrange
        var context = new DefaultHttpContext();

        RequestDelegate next = async (HttpContext ctx) =>
        {
            await Task.Delay(0);
        };

        var loggerMock = new Mock<ILogger<ErrorHandlingMiddleware>>();
        var middleware = new ErrorHandlingMiddleware(next, loggerMock.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be(200); // Default StatusCode when no exception
    }

    [Theory]
    [InlineData(typeof(ArgumentNullException))]
    [InlineData(typeof(InvalidOperationException))]
    [InlineData(typeof(NotSupportedException))]
    public async Task InvokeAsync_HandlesVariousExceptionTypes(Type exceptionType)
    {
        // Arrange
        var context = new DefaultHttpContext();
        var ms = new MemoryStream();
        context.Response.Body = ms;

        var exception = (Exception)Activator.CreateInstance(exceptionType, "Test message")!;

        RequestDelegate next = (HttpContext ctx) => throw exception;

        var loggerMock = new Mock<ILogger<ErrorHandlingMiddleware>>();
        var middleware = new ErrorHandlingMiddleware(next, loggerMock.Object);

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
        ms.Position = 0;
        using var reader = new StreamReader(ms);
        var response = reader.ReadToEnd();
        response.Should().NotBeEmpty();
    }
}
