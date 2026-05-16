using Microsoft.AspNetCore.Mvc;
using SizzlingHotProducts.Api.DTOs;

namespace SizzlingHotProducts.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(ApiResponse<object>.Ok(new { status = "healthy" }));
    }
}
