using System;
using System.ComponentModel.DataAnnotations;

namespace IntranetAPI.Entities;

public class CelebrationMessage
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    public string SenderId { get; set; } = string.Empty;

    [Required]
    public string ReceiverId { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public bool IsRead { get; set; } = false;

    [MaxLength(20)]
    public string? ReactionEmoji { get; set; }

    public ApplicationUser? Sender { get; set; }
    public ApplicationUser? Receiver { get; set; }
}