using IntranetAPI.DTOs;
using IntranetAPI.Entities;

namespace IntranetAPI.Interfaces
{
    public interface IBlogService
    {
        Task<List<Blog>> GetBlogsAsync();
        Task<Blog> CreateBlogAsync(CreateBlogDTO dto);
        Task<List<BlogCategory>> GetCategoriesAsync();
        Task<string> UploadEditorImageAsync(IFormFile image);
        Task<Blog?> GetBlogByIdAsync(int id);
    }
}