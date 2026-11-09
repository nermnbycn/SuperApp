
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntranetAPI.Entities;

[Table("AnnouncementCompanies", Schema = "dbo")]
public class AnnouncementCompany
{
    [Key]
    public int Id { get; set; }

    public DateTime CreateTime { get; set; } = DateTime.Now;
    public string? CreatedBy { get; set; }

    public DateTime? UpdateTime { get; set; }
    public string? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime? DeleteTime { get; set; }
    public string? DeletedBy { get; set; }

    public int CompanyId { get; set; }
    public int AnnouncementId { get; set; }

    public Announcement Announcement { get; set; } = null!;
    public Company Company { get; set; } = null!;
}
