using System;
using static IntranetAPI.DTOs.AuthDTO;
using Microsoft.AspNetCore.Identity;

namespace IntranetAPI.Interfaces;

public interface IAuthService
{
    Task<string?> LoginAsync(LoginDTO loginDto);
    Task<bool> LogoutAsync(string userId);
    Task<IdentityResult> ChangePasswordAsync(
    string userId,
    ChangePasswordDto dto);
}
