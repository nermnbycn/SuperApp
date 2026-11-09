using IntranetAPI.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IntranetAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementController : ControllerBase
    {
        private readonly IAnnouncementService _announcementService;

        public AnnouncementController(IAnnouncementService announcementService)
        {
            _announcementService = announcementService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAnnouncement()
        {
            var announcements =
                await _announcementService.GetAllAnnouncement();

            return Ok(announcements);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var announcement =
                await _announcementService.GetAnnouncementByIdAsync(id);

            if (announcement == null)
            {
                return NotFound(new
                {
                    message = "Duyuru bulunamadı."
                });
            }

            return Ok(announcement);
        }

    }
}
