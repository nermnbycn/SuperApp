using Microsoft.AspNetCore.Identity;

public class ApplicationUser : IdentityUser
{
    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    // DOĞUM TARİHİ
    public DateOnly BirthDate { get; set; }

    // İŞE GİRİŞ TARİHİ
    public DateOnly HireDate { get; set; }
    // PROFİL FOTOĞRAFI
    public string? ImageUrl { get; set; }
}