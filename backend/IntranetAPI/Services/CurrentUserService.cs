using System;

using System.Security.Claims;
using IntranetAPI.Interfaces;

namespace IntranetAPI.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(
        IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string GetUserId()
    {
        var userId = _httpContextAccessor.HttpContext?
            .User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            throw new UnauthorizedAccessException(
                "Giriş yapan kullanıcı bulunamadı."
            );
        }

        return userId;
    }

    public bool IsAuthenticated()
    {
        return _httpContextAccessor.HttpContext?
            .User.Identity?.IsAuthenticated == true;
    }
}
