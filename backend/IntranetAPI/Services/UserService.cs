
using IntranetAPI.Data;
using IntranetAPI.Interfaces;
using Microsoft.EntityFrameworkCore;
using static IntranetAPI.DTOs.CelebrationDTO;

namespace IntranetAPI.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    // BUGÜN DOĞUM GÜNÜ OLANLAR
    public async Task<List<BirthdayDTO>> GetTodayBirthdaysAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        return await _context.Users
            .AsNoTracking()
            .Where(x =>
                x.DateofBirth.Day == today.Day &&
                x.DateofBirth.Month == today.Month)
            .Select(x => new BirthdayDTO
            {
                Id = x.Id,
                NameSurname = x.NameSurname,
                DateofBirth = x.DateofBirth,
                ImageUrl = x.ImageUrl
            })
            .ToListAsync();
    }

    // BUGÜN İŞ YIL DÖNÜMÜ OLANLAR
    public async Task<List<AnniversaryDTO>> GetTodayWorkAnniversariesAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        return await _context.Users
            .AsNoTracking()
            .Where(x =>
                x.StartDate.Day == today.Day &&
                x.StartDate.Month == today.Month &&
                x.StartDate.Year < today.Year)
            .Select(x => new AnniversaryDTO
            {
                Id = x.Id,
                NameSurname = x.NameSurname,
                StartDate = x.StartDate,
                ImageUrl = x.ImageUrl
            })
            .ToListAsync();
    }

    // BU HAFTA DOĞUM GÜNÜ OLANLAR
    public async Task<List<WeeklyBirthdayDTO>> GetWeeklyBirthdaysAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        int daysFromMonday = ((int)today.DayOfWeek + 6) % 7;
        var sunday = today.AddDays(6 - daysFromMonday);

        var users = await _context.Users
            .AsNoTracking()
            .Select(u => new
            {
                u.Id,
                u.NameSurname,
                u.DateofBirth,
                u.ImageUrl
            })
            .ToListAsync();

        return users
            .Select(u =>
            {
                var nextBirthday = new DateOnly(
                    today.Year,
                    u.DateofBirth.Month,
                    Math.Min(
                        u.DateofBirth.Day,
                        DateTime.DaysInMonth(
                            today.Year,
                            u.DateofBirth.Month
                        )
                    )
                );

                if (nextBirthday < today)
                {
                    int nextYear = today.Year + 1;

                    nextBirthday = new DateOnly(
                        nextYear,
                        u.DateofBirth.Month,
                        Math.Min(
                            u.DateofBirth.Day,
                            DateTime.DaysInMonth(
                                nextYear,
                                u.DateofBirth.Month
                            )
                        )
                    );
                }

                return new
                {
                    User = u,
                    NextBirthday = nextBirthday,
                    Days = nextBirthday.DayNumber - today.DayNumber
                };
            })
            .Where(x =>
                x.Days > 0 &&
                x.NextBirthday <= sunday
            )
            .OrderBy(x => x.Days)
            .Select(x => new WeeklyBirthdayDTO
            {
                Id = x.User.Id,
                NameSurname = x.User.NameSurname,
                DateofBirth = x.User.DateofBirth,
                ImageUrl = x.User.ImageUrl,
                DaysUntilBirthday = x.Days
            })
            .ToList();
    }

    // BU HAFTA İŞ YIL DÖNÜMÜ OLANLAR
    public async Task<List<WeeklyAnniversaryDTO>> GetWeeklyAnniversariesAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        int daysFromMonday = ((int)today.DayOfWeek + 6) % 7;
        var sunday = today.AddDays(6 - daysFromMonday);

        var users = await _context.Users
            .AsNoTracking()
            .Where(u => u.StartDate.Year < today.Year)
            .Select(u => new
            {
                u.Id,
                u.NameSurname,
                u.StartDate,
                u.ImageUrl
            })
            .ToListAsync();

        return users
            .Select(u =>
            {
                int day = Math.Min(
                    u.StartDate.Day,
                    DateTime.DaysInMonth(
                        today.Year,
                        u.StartDate.Month
                    )
                );

                var anniversary = new DateOnly(
                    today.Year,
                    u.StartDate.Month,
                    day
                );

                if (anniversary < today)
                {
                    int nextYear = today.Year + 1;

                    anniversary = new DateOnly(
                        nextYear,
                        u.StartDate.Month,
                        Math.Min(
                            u.StartDate.Day,
                            DateTime.DaysInMonth(
                                nextYear,
                                u.StartDate.Month
                            )
                        )
                    );
                }

                return new
                {
                    User = u,
                    Anniversary = anniversary,
                    Days = anniversary.DayNumber - today.DayNumber
                };
            })
            .Where(x =>
                x.Days > 0 &&
                x.Anniversary <= sunday
            )
            .OrderBy(x => x.Days)
            .Select(x => new WeeklyAnniversaryDTO
            {
                Id = x.User.Id,
                NameSurname = x.User.NameSurname,
                StartDate = x.User.StartDate,
                ImageUrl = x.User.ImageUrl,
                DaysUntilAnniversary = x.Days
            })
            .ToList();
    }
}
