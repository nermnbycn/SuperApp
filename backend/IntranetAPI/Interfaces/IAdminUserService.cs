
using IntranetAPI.DTOs;
using Microsoft.AspNetCore.Identity;
using static IntranetAPI.DTOs.UserDTO;

namespace IntranetAPI.Interfaces;

public interface IAdminUserService
{
    Task<(IdentityResult Result, string? UserId)> CreateUserAsync(
        CreateUserDTO dto,
        string createdBy
    );
}
