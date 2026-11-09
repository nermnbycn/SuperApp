
namespace IntranetAPI.Entities;

public class GroupNew
{
    public int Id { get; set; }

    public DateTime? CreateTime { get; set; }

    public string? CreatedBy { get; set; }

    public DateTime? UpdateTime { get; set; }

    public string? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; }

    public DateTime? DeleteTime { get; set; }

    public string? DeletedBy { get; set; }

    public string? Title { get; set; }

    public string? Content { get; set; }

    public string? ImageUrl { get; set; }

    public int Hit { get; set; }
}
