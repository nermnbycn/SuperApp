using IntranetAPI.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace IntranetAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        [HttpGet("remaining-week")]
        public async Task<IActionResult> GetRemainingWeekMenus()
        {
            var menus = await _menuService.GetRemainingWeekMenusAsync();

            return Ok(menus);
        }

    }
}

