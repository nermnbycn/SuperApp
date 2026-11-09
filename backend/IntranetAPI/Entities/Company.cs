
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace IntranetAPI.Entities;

[Table("Companies", Schema = "dbo")]
public class Company
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;
    public int TenantId { get; set; }

public Tenant Tenant { get; set; } = null!;

public bool IsActive { get; set; } = true;
public string? LogoUrl { get; set; }
public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

