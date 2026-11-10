using System;

namespace IntranetAPI.Dto_s;

public class ProfileDTO
{
    public string id { get; set; } = string.Empty;
    public string NameSurname { get; set; } = string.Empty;

    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public DateOnly DateofBirth { get; set; }
    public DateOnly StartDate { get; set; }

    public string? ImageUrl { get; set; }

}
