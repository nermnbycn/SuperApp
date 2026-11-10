
using System.ComponentModel.DataAnnotations;

namespace IntranetAPI.DTOs;

public class UserDTO
{
    public class CreateUserDTO
    {
        [Required]
        public string NameSurname { get; set; } = string.Empty;

        [Required, EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public int? DepartmentId { get; set; }
        public string? RegistryNo { get; set; }
        public string? Title { get; set; }
        public string? DomainName { get; set; }
        public string? CollarType { get; set; }
        public string? ImageUrl { get; set; }
        public string? ManagerRegistryNo { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        [Required]
        public DateOnly DateofBirth { get; set; }

        public bool IsManager { get; set; }
        public bool IsExceptional { get; set; }

        public string? ShortCode { get; set; }
        public string? WorkPhone { get; set; }
        public string? PersonalPhone { get; set; }
    }
}
