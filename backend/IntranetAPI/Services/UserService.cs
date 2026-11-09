using System;
using IntranetAPI.Data;
using IntranetAPI.Entities;
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

    public async Task<List<BirthdayDTO>> GetTodayBirthdaysAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        return await _context.Users  //Gün ve ay değerleri eşleşiyorsa o kişilerin listesini alalım
            .AsNoTracking() //Değişiklik takibine alınmamasını sağlar
            .Where(x => x.BirthDate.Day == today.Day &&
                        x.BirthDate.Month == today.Month)
                         .Select(x => new BirthdayDTO
                         {
                             Id = x.Id,
                             FirstName = x.FirstName,
                             LastName = x.LastName,
                             BirthDate = x.BirthDate,
                             ImageUrl = x.ImageUrl
                         })
            .ToListAsync();
    }

    public async Task<List<AnniversaryDTO>> GetTodayWorkAnniversariesAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        return await _context.Users
            .AsNoTracking()
            .Where(x => x.HireDate.Day == today.Day &&
                        x.HireDate.Month == today.Month &&
                        x.HireDate.Year < today.Year)
                         .Select(x => new AnniversaryDTO
                         {
                             Id = x.Id,
                             FirstName = x.FirstName,
                             LastName = x.LastName,
                             HireDate = x.HireDate,
                             ImageUrl = x.ImageUrl
                         })
            .ToListAsync();
    }
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
                u.FirstName,
                u.LastName,
                u.BirthDate,
                u.ImageUrl
            })
            .ToListAsync();

        return users
            .Select(u =>
            {
                var nextBirthday = new DateOnly(
                    today.Year,
                    u.BirthDate.Month,
                    Math.Min(
                        u.BirthDate.Day,
                        DateTime.DaysInMonth(
                            today.Year,
                            u.BirthDate.Month
                        )
                    )
                );

                if (nextBirthday < today)
                {
                    int year = today.Year + 1;

                    nextBirthday = new DateOnly(
                        year,
                        u.BirthDate.Month,
                        Math.Min(
                            u.BirthDate.Day,
                            DateTime.DaysInMonth(
                                year,
                                u.BirthDate.Month
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
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                BirthDate = x.User.BirthDate,
                ImageUrl = x.User.ImageUrl,
                DaysUntilBirthday = x.Days
            })
            .ToList();
    }
    public async Task<List<WeeklyAnniversaryDTO>> GetWeeklyAnniversariesAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        int daysFromMonday = ((int)today.DayOfWeek + 6) % 7;
        var sunday = today.AddDays(6 - daysFromMonday);

        var users = await _context.Users
            .AsNoTracking()
            .Where(u => u.HireDate.Year < today.Year)
            .Select(u => new
            {
                u.Id,
                u.FirstName,
                u.LastName,
                u.HireDate,
                u.ImageUrl
            })
            .ToListAsync();

        return users
            .Select(u =>
            {
                int day = Math.Min(
                    u.HireDate.Day,
                    DateTime.DaysInMonth(today.Year, u.HireDate.Month)
                );

                var anniversary = new DateOnly(
                    today.Year,
                    u.HireDate.Month,
                    day
                );

                if (anniversary < today)
                {
                    int nextYear = today.Year + 1;

                    anniversary = new DateOnly(
                        nextYear,
                        u.HireDate.Month,
                        Math.Min(
                            u.HireDate.Day,
                            DateTime.DaysInMonth(nextYear, u.HireDate.Month)
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
                FirstName = x.User.FirstName,
                LastName = x.User.LastName,
                HireDate = x.User.HireDate,
                ImageUrl = x.User.ImageUrl,
                DaysUntilAnniversary = x.Days
            })
            .ToList();
    }






}
