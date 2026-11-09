using System;

namespace IntranetAPI.Dto_s;

public class ProfileDTO
{
    public string id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public DateOnly BirthDate { get; set; }
    public DateOnly HireDate { get; set; }

    public string? ImageUrl { get; set; }

}
