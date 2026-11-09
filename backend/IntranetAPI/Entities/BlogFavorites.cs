using System;

namespace IntranetAPI.Entities;

public class BlogFavorites
{
    public int Id { get; set; }

    public string? UserId { get; set; }  // Blogu ekleyen kullanıcının ID'si
    public ApplicationUser? User { get; set; }


    public int BlogId { get; set; }
    public Blog? blog { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;

}
