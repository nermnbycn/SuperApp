
using IntranetAPI.Data;
using IntranetAPI.DTOs;
using IntranetAPI.Entities;
using IntranetAPI.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace IntranetAPI.Services
{
    public class BlogService : IBlogService
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ICurrentUserService _currentUserService;

        private const long MaxImageSize = 5 * 1024 * 1024;

        private static readonly string[] AllowedExtensions =
        {
            ".jpg", ".jpeg", ".png", ".webp"
        };

        public BlogService(
            AppDbContext context,
            IWebHostEnvironment environment,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _environment = environment;
            _currentUserService = currentUserService;
        }

        // KATEGORİLERİ GETİR
        public async Task<List<BlogCategory>> GetCategoriesAsync()
        {
            return await _context.BlogCategories
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .ToListAsync();
        }

        // BLOG OLUŞTUR
        public async Task<Blog> CreateBlogAsync(CreateBlogDTO dto)
        {
            // Giriş yapan kullanıcı tokendan tespit edilir
            var userId = _currentUserService.GetUserId();

            if (dto.Image == null || dto.Image.Length == 0)
                throw new ArgumentException("Fotoğraf zorunludur.");

            if (string.IsNullOrWhiteSpace(dto.Title) ||
                string.IsNullOrWhiteSpace(dto.Content))
            {
                throw new ArgumentException(
                    "Başlık ve içerik zorunludur.");
            }

            if (dto.CategoryId == null ||
                !await _context.BlogCategories.AnyAsync(
                    x => x.Id == dto.CategoryId.Value))
            {
                throw new ArgumentException("Geçersiz kategori.");
            }

            await ValidateImageAsync(dto.Image);

            var webRoot = GetWebRoot();

            var uploadPath = Path.Combine(
                webRoot, "uploads", "blog");

            Directory.CreateDirectory(uploadPath);

            var extension = Path.GetExtension(
                dto.Image.FileName).ToLowerInvariant();

            var fileName = $"{Guid.NewGuid():N}{extension}";
            var filePath = Path.Combine(uploadPath, fileName);

            await using (var stream = new FileStream(
                filePath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                81920,
                useAsync: true))
            {
                await dto.Image.CopyToAsync(stream);
            }

            var blog = new Blog
            {
                Title = dto.Title.Trim(),

                // Rich Editor'den gelen HTML içerik
                Content = dto.Content,

                CategoryId = dto.CategoryId,
                UserId = userId,

                ImageUrl = $"/uploads/blog/{fileName}",

                CreatedAt = DateTime.Now,
                ViewCount = 0
            };

            try
            {
                _context.Blogs.Add(blog);
                await _context.SaveChangesAsync();
            }
            catch
            {
                if (File.Exists(filePath))
                    File.Delete(filePath);

                throw;
            }

            return blog;
        }

        // HTML EDİTÖRÜNE GÖRSEL YÜKLE
        public async Task<string> UploadEditorImageAsync(
            IFormFile image)
        {
            // İşlemin giriş yapmış kullanıcıya ait olması için
            // mevcut kullanıcı servisinden kimliği alıyoruz.
            var userId = _currentUserService.GetUserId();

            if (string.IsNullOrWhiteSpace(
                Convert.ToString(userId)))
            {
                throw new UnauthorizedAccessException(
                    "Görsel yüklemek için giriş yapmalısınız.");
            }

            await ValidateImageAsync(image);

            var webRoot = GetWebRoot();

            var uploadPath = Path.Combine(
                webRoot,
                "uploads",
                "blog",
                "content"
            );

            Directory.CreateDirectory(uploadPath);

            var extension = Path.GetExtension(
                image.FileName).ToLowerInvariant();

            var fileName = $"{Guid.NewGuid():N}{extension}";

            var filePath = Path.Combine(
                uploadPath,
                fileName
            );

            try
            {
                await using (var stream = new FileStream(
                    filePath,
                    FileMode.CreateNew,
                    FileAccess.Write,
                    FileShare.None,
                    81920,
                    useAsync: true))
                {
                    await image.CopyToAsync(stream);
                }
            }
            catch
            {
                if (File.Exists(filePath))
                    File.Delete(filePath);

                throw;
            }

            // Backend üzerinde erişilebilir görsel yolu
            return $"/uploads/blog/content/{fileName}";
        }

        // GÖRSEL DOĞRULAMA
        private static async Task ValidateImageAsync(
            IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                throw new ArgumentException(
                    "Lütfen bir görsel seçin.");
            }

            if (image.Length > MaxImageSize)
            {
                throw new ArgumentException(
                    "Fotoğraf en fazla 5 MB olabilir.");
            }

            var extension = Path.GetExtension(
                image.FileName).ToLowerInvariant();

            if (!AllowedExtensions.Contains(extension))
            {
                throw new ArgumentException(
                    "Yalnızca JPG, JPEG, PNG ve WEBP görselleri yüklenebilir.");
            }

            var expectedMime = extension switch
            {
                ".jpg" or ".jpeg" => "image/jpeg",
                ".png" => "image/png",
                ".webp" => "image/webp",
                _ => ""
            };

            if (!string.Equals(
                image.ContentType,
                expectedMime,
                StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException(
                    "Görselin dosya türü geçersiz.");
            }

            // Dosyanın gerçek başlangıç baytlarını kontrol et
            byte[] header = new byte[12];

            await using var stream = image.OpenReadStream();

            int totalRead = 0;

            while (totalRead < header.Length)
            {
                int read = await stream.ReadAsync(
                    header.AsMemory(
                        totalRead,
                        header.Length - totalRead)
                );

                if (read == 0)
                    break;

                totalRead += read;
            }

            bool validImage = extension switch
            {
                ".jpg" or ".jpeg" =>
                    totalRead >= 3 &&
                    header[0] == 0xFF &&
                    header[1] == 0xD8 &&
                    header[2] == 0xFF,

                ".png" =>
                    totalRead >= 8 &&
                    header.AsSpan(0, 8).SequenceEqual(
                        new byte[]
                        {
                            137, 80, 78, 71, 13, 10, 26, 10
                        }),

                ".webp" =>
                    totalRead >= 12 &&
                    header.AsSpan(0, 4).SequenceEqual(
                        "RIFF"u8) &&
                    header.AsSpan(8, 4).SequenceEqual(
                        "WEBP"u8),

                _ => false
            };

            if (!validImage)
            {
                throw new ArgumentException(
                    "Geçersiz görsel içeriği.");
            }
        }

        // WWWROOT KLASÖRÜNÜ BUL
        private string GetWebRoot()
        {
            return _environment.WebRootPath ??
                Path.Combine(
                    _environment.ContentRootPath,
                    "wwwroot"
                );
        }

        // BLOGLARI GETİR
        public async Task<List<Blog>> GetBlogsAsync()
        {
            return await _context.Blogs
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
        public async Task<Blog?> GetBlogByIdAsync(int id)
        {
            return await _context.Blogs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
