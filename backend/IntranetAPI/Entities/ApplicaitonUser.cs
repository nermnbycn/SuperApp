
using Microsoft.AspNetCore.Identity;

public class ApplicationUser : IdentityUser
{
    // MEVCUT ALANLAR
    public string   NameSurname { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }

    // KAYIT BİLGİLERİ
    public DateTime? CreateTime { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdateTime { get; set; }
    public string? UpdatedBy { get; set; }

    // SİLİNME BİLGİLERİ
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeleteTime { get; set; }
    public string? DeletedBy { get; set; }

    // PERSONEL BİLGİLERİ
    public int? DepartmentId { get; set; }
    public string? RegistryNo { get; set; }

    public string? Title { get; set; }
    public string? DomainName { get; set; }
    public string? CollarType { get; set; }

    // YÖNETİCİ BİLGİLERİ
    public string? ManagerRegistryNo { get; set; }
    public bool IsManager { get; set; } = false;

    // TARİHLER
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public DateOnly DateofBirth { get; set; }

    // İLETİŞİM
    public string? ShortCode { get; set; }
    public string? WorkPhone { get; set; }
    public string? PersonalPhone { get; set; }

    // DİĞER
    public bool IsExceptional { get; set; } = false;
}
