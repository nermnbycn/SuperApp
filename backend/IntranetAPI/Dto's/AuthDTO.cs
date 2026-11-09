using System;

namespace IntranetAPI.DTOs;

public class AuthDTO
{
    public class RegisterDTO
    {
        public string UserName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;

    }
    public class LoginDTO
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    public class UpdateDTO
    {
        public string? UserName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? telephone { get; set; }

    }
    public class ChangePasswordDto
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}




    public class AuthResponseDTO
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }
}
