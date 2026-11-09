
using Microsoft.EntityFrameworkCore;
using IntranetAPI.Entities;
using IntranetAPI.Services.Interfaces;
using IntranetAPI.Data;

namespace IntranetAPI.Services;

public class AnnouncementService : IAnnouncementService
{
    private readonly AppDbContext _context;

    public AnnouncementService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Announcement>> GetAllAnnouncement()
    {
        return await _context.Announcements
            .AsNoTracking()
            .Where(x => !x.IsDeleted)
            .OrderByDescending(x => x.CreateTime)
            .ThenByDescending(x => x.Id)
            .ToListAsync();
    }
    public async Task<Announcement?> GetAnnouncementByIdAsync(int id)
    {
        return await _context.Announcements
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);
    }
}
