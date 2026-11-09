
using System.Security.Claims;
using IntranetAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static IntranetAPI.DTOs.AuthDTO;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginDTO loginDto)
    {
        var token = await _authService.LoginAsync(loginDto);

        if (token == null)
        {
            return Unauthorized(new
            {
                message = "E-posta veya şifre hatalı ya da hesap kullanılamıyor."
            });
        }

        return Ok(new
        {
            token
        });
    }
    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var result = await _authService.LogoutAsync(userId);

        if (!result)
            return BadRequest("Çıkış işlemi başarısız.");

        return Ok(new
        {
            message = "Çıkış işlemi başarılı."
        });
    }

    [Authorize]
[HttpPut("change-password")]
public async Task<IActionResult> ChangePassword(
    [FromBody] ChangePasswordDto dto)
{
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (string.IsNullOrEmpty(userId))
        return Unauthorized("Kullanıcı kimliği bulunamadı.");

    var result = await _authService.ChangePasswordAsync(userId, dto);

    if (!result.Succeeded)
    {
        return BadRequest(new
        {
            message = "Şifre değiştirilemedi.",
            errors = result.Errors.Select(e => e.Description)
        });
    }

    return Ok(new
    {
        message = "Şifre başarıyla değiştirildi."
    });
}
}
