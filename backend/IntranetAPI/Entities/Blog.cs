using System;

namespace IntranetAPI.Entities;

public class Blog
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }

    public int? CategoryId { get; set; }
    public BlogCategory? Category { get; set; }


    public string? UserId { get; set; }  // Blogu ekleyen kullanıcının ID'si
    public ApplicationUser? User { get; set; }


    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public int ViewCount { get; set; } = 0;


}
