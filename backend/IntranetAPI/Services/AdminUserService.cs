
using IntranetAPI.Interfaces;
using Microsoft.AspNetCore.Identity;
using static IntranetAPI.DTOs.UserDTO;

namespace IntranetAPI.Services;

public class AdminUserService : IAdminUserService
{
    private readonly UserManager<ApplicationUser> _userManager;

    public AdminUserService(
        UserManager<ApplicationUser> userManager)
    {
        _userManager = userManager;
    }

    public async Task<(IdentityResult Result, string? UserId)>
        CreateUserAsync(CreateUserDTO dto, string createdBy)
    {
        var email = dto.Email.Trim();

        var existingUser =
            await _userManager.FindByEmailAsync(email);

        if (existingUser != null)
        {
            return (
                IdentityResult.Failed(new IdentityError
                {
                    Code = "DuplicateEmail",
                    Description = "Bu e-posta zaten kayıtlı."
                }),
                null
            );
        }

        var nameSurname = dto.NameSurname.Trim();

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,

            NameSurname = nameSurname,

            DepartmentId = dto.DepartmentId,
            RegistryNo = dto.RegistryNo,
            Title = dto.Title,
            DomainName = dto.DomainName,
            CollarType = dto.CollarType,
            ImageUrl = dto.ImageUrl,
            ManagerRegistryNo = dto.ManagerRegistryNo,

            StartDate = dto.StartDate,
            EndDate = null,
            DateofBirth = dto.DateofBirth,

            IsManager = dto.IsManager,
            IsExceptional = dto.IsExceptional,

            ShortCode = dto.ShortCode,
            WorkPhone = dto.WorkPhone,
            PersonalPhone = dto.PersonalPhone,
            PhoneNumber = dto.PersonalPhone,

            IsDeleted = false,
            CreateTime = DateTime.UtcNow,
            CreatedBy = createdBy
        };

        var result = await _userManager.CreateAsync(
            user,
            dto.Password
        );

        return (
            result,
            result.Succeeded ? user.Id : null
        );
    }
}
