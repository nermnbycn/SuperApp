using System;

using IntranetAPI.Entities;
using static IntranetAPI.DTOs.CelebrationDTO;

namespace IntranetAPI.Interfaces;

public interface IUserService
{
    Task<List<BirthdayDTO>> GetTodayBirthdaysAsync();
    Task<List<AnniversaryDTO>> GetTodayWorkAnniversariesAsync();
    Task<List<WeeklyBirthdayDTO>> GetWeeklyBirthdaysAsync();
    Task<List<WeeklyAnniversaryDTO>> GetWeeklyAnniversariesAsync();

}
