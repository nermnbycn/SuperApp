
using IntranetAPI.DTOs;
using IntranetAPI.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IntranetAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly IBlogService _blogService;

        public BlogController(IBlogService blogService)
        {
            _blogService = blogService;
        }

        // TÜM BLOGLARI GETİR
        // GET: api/Blog
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var blogs = await _blogService.GetBlogsAsync();

            return Ok(blogs);
        }

        // ID'YE GÖRE BLOG GETİR
        // GET: api/Blog/1
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var blog = await _blogService.GetBlogByIdAsync(id);

            if (blog == null)
            {
                return NotFound(new
                {
                    message = "Blog bulunamadı."
                });
            }

            return Ok(blog);
        }

        // BLOG KATEGORİLERİNİ GETİR
        // GET: api/Blog/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories =
                await _blogService.GetCategoriesAsync();

            return Ok(categories);
        }

        // YENİ BLOG OLUŞTUR
        // POST: api/Blog
        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create(
            [FromForm] CreateBlogDTO dto)
        {
            try
            {
                var blog =
                    await _blogService.CreateBlogAsync(dto);

                return Ok(blog);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // HTML EDİTÖRÜNE GÖRSEL YÜKLE
        // POST: api/Blog/upload-image
        [HttpPost("upload-image")]
        [Authorize]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(10 * 1024 * 1024)]
        public async Task<IActionResult> UploadEditorImage(
            IFormFile image)
        {
            try
            {
                var imagePath =
                    await _blogService.UploadEditorImageAsync(image);

                var imageUrl =
                    $"{Request.Scheme}://{Request.Host}{imagePath}";

                return Ok(new
                {
                    url = imageUrl,
                    path = imagePath
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new
                {
                    message = ex.Message
                });
            }
        }
    }
}
