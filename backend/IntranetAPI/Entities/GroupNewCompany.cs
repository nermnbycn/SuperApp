

namespace IntranetAPI.Entities;

public class GroupNewCompany
{
    public int Id { get; set; }

    public DateTime? CreateTime { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? UpdateTime { get; set; }

    public string? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime? DeleteTime { get; set; }

    public string? DeletedBy { get; set; }

    public int CompanyId { get; set; }


    public Company Company { get; set; } = null!;

    public int GroupNewId { get; set; }

    // Navigation Properties
    public GroupNew GroupNew { get; set; } = null!;

    // Company entity'si projede varsa eklenebilir:
    // public Company Company { get; set; } = null!;
}
