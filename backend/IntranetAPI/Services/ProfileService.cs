using System;
using IntranetAPI.Data;
using IntranetAPI.Dto_s;
using IntranetAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IntranetAPI.Services;

public class ProfileService : IProfileService
{
    private readonly AppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public ProfileService(
        AppDbContext context,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    public async Task<ProfileDTO?> GetMyProfileAsync()
    {
        var userId = _currentUserService.GetUserId();

        return await _context.Users
            .AsNoTracking()
            .Where(x => x.Id == userId)
            .Select(x => new ProfileDTO
            {
                id = userId,
                FirstName = x.FirstName,
                LastName = x.LastName,
                BirthDate = x.BirthDate,
                ImageUrl = x.ImageUrl,
                HireDate = x.HireDate,
                Email = x.Email,
                PhoneNumber = x.PhoneNumber,
            })
            .FirstOrDefaultAsync();
    }

}
