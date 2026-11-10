
using System.Security.Claims;
using IntranetAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static IntranetAPI.DTOs.UserDTO;

namespace IntranetAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser(
        [FromBody] CreateUserDTO dto)
    {
        var adminId =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(adminId))
            return Unauthorized();

        var (result, userId) =
            await _adminUserService.CreateUserAsync(dto, adminId);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Kullanıcı oluşturulamadı.",
                errors = result.Errors.Select(e => e.Description)
            });
        }

        return StatusCode(201, new
        {
            message = "Kullanıcı başarıyla oluşturuldu.",
            id = userId
        });
    }
}
