
using IntranetAPI.Entities;

namespace IntranetAPI.Services.Interfaces;

public interface IAnnouncementService
{
    Task<List<Announcement>> GetAllAnnouncement();
    Task<Announcement?> GetAnnouncementByIdAsync(int id);
}
