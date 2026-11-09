using IntranetAPI.Data;
using Microsoft.EntityFrameworkCore;
using IntranetAPI.Entities;
using IntranetAPI.Interfaces;


namespace IntranetAPI.Services;

public class GroupNewService : IGroupNewService
{
    private readonly AppDbContext _context;

    public GroupNewService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<GroupNew>> GetAllNews()
    {
        return await _context.GroupNews
            .AsNoTracking()
            .Where(x => !x.IsDeleted)
            .OrderByDescending(x => x.CreateTime)
            .ThenByDescending(x => x.Id)
            .ToListAsync();
    }

    public async Task<GroupNew?> GetGroupNewByIdAsync(int id)
    {
        return await _context.GroupNews
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id);
    }

}