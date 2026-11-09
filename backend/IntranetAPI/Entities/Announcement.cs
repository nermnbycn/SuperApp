
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntranetAPI.Entities;

[Table("Announcement", Schema = "dbo")]
public class Announcement
{
    [Key]
    public int Id { get; set; }

    public DateTime? CreateTime { get; set; }
    public string? CreatedBy { get; set; }

    public DateTime? UpdateTime { get; set; }
    public string? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime? DeleteTime { get; set; }
    public string? DeletedBy { get; set; }

    // Duyuru bilgileri
    [Required]
    [MaxLength(250)]
    public string Title { get; set; } = string.Empty;

    public string? Content { get; set; }

    public string? ImageUrl { get; set; }

    public int Hit { get; set; } = 0;


}
