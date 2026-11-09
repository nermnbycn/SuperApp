
using IntranetAPI.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace IntranetAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("birthdays/today")]
        public async Task<IActionResult> GetTodayBirthdays()
        {
            var users = await _userService.GetTodayBirthdaysAsync();
            return Ok(users);
        }
        [HttpGet("birthdays/week")]
        public async Task<IActionResult> GetWeeklyBirthdays()
        {
            var users = await _userService.GetWeeklyBirthdaysAsync();

            return Ok(users);
        }

        [HttpGet("anniversaries/today")]
        public async Task<IActionResult> GetTodayWorkAnniversaries()
        {
            var users = await _userService.GetTodayWorkAnniversariesAsync();
            return Ok(users);
        }
        [HttpGet("anniversaries/week")]
        public async Task<IActionResult> GetWeeklyAnniversaries()
        {
            var users = await _userService.GetWeeklyAnniversariesAsync();

            return Ok(users);
        }
    }
}

