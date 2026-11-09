
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IntranetAPI.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using static IntranetAPI.DTOs.AuthDTO;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _configuration = configuration;
    }

    public async Task<string?> LoginAsync(LoginDTO loginDto)
    {
        var email = loginDto.Email.Trim();

        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
            return null;

        var result = await _signInManager.CheckPasswordSignInAsync(
            user,
            loginDto.Password,
            lockoutOnFailure: true
        );

        if (!result.Succeeded)
            return null;

        return GenerateJwtToken(user);
    }

    public async Task<bool> LogoutAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return false;

        var result = await _userManager.UpdateSecurityStampAsync(user);

        return result.Succeeded;
    }

    private string GenerateJwtToken(ApplicationUser user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        var key = jwtSettings["Key"]
            ?? throw new InvalidOperationException(
                "JWT Key yapılandırılmamış."
            );

        if (Encoding.UTF8.GetByteCount(key) < 32)
            throw new InvalidOperationException(
                "JWT Key en az 32 bayt olmalıdır."
            );

        var issuer = jwtSettings["Issuer"]
            ?? throw new InvalidOperationException(
                "JWT Issuer yapılandırılmamış."
            );

        var audience = jwtSettings["Audience"]
            ?? throw new InvalidOperationException(
                "JWT Audience yapılandırılmamış."
            );

        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key)
        );

        var credentials = new SigningCredentials(
            securityKey,
            SecurityAlgorithms.HmacSha256
        );

        var claims = new[]
        {
            new Claim(
                JwtRegisteredClaimNames.Sub,
                user.Id
            ),
            new Claim(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString()
            ),
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id
            )
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
    public async Task<IdentityResult> ChangePasswordAsync(
    string userId,
    ChangePasswordDto dto)
{
    var user = await _userManager.FindByIdAsync(userId);

    if (user == null)
    {
        return IdentityResult.Failed(
            new IdentityError
            {
                Description = "Kullanıcı bulunamadı."
            });
    }

    return await _userManager.ChangePasswordAsync(
        user,
        dto.CurrentPassword,
        dto.NewPassword
    );
}
}

