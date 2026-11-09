using System.ComponentModel.DataAnnotations;

namespace IntranetAPI.DTOs
{
    public class CreateBlogDTO
    {
        [Required]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public int? CategoryId { get; set; }

        [Required]
        public IFormFile? Image { get; set; }
    }
}