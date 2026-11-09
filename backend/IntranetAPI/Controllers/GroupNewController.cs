
using IntranetAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IntranetAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GroupNewController : ControllerBase
    {
        private readonly IGroupNewService _groupNewService;

        public GroupNewController(IGroupNewService groupNewService)
        {
            _groupNewService = groupNewService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var news = await _groupNewService.GetAllNews();

            return Ok(news);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var news = await _groupNewService.GetGroupNewByIdAsync(id);

            if (news == null)
                return NotFound(new { message = "Haber bulunamadı." });

            return Ok(news);
        }


    }
}
