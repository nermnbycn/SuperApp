
using IntranetAPI.Data;
using IntranetAPI.Entities;
using IntranetAPI.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace IntranetAPI.Services
{
    public class MenuService : IMenuService
    {
        private readonly AppDbContext _context;

        public MenuService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<FoodMenu>> GetRemainingWeekMenusAsync()
        {
            var today = DateOnly.FromDateTime(DateTime.Today);

            // Bugün ve sonrasındaki kayıtlı ilk 5 menü
            var menus = await _context.FoodMenus
                .AsNoTracking()
                .Where(x => x.MenuDate >= today)
                .OrderBy(x => x.MenuDate)
                .Take(5)
                .ToListAsync();

            // Bugünün menüsü yoksa pasif gösterilecek boş kayıt ekle
            if (!menus.Any(x => x.MenuDate == today))
            {
                menus.Insert(0, new FoodMenu
                {
                    MenuDate = today,
                    Food1 = string.Empty,
                    Food2 = string.Empty,
                    Food3 = string.Empty,
                    Food4 = string.Empty,
                    Calorie1 = 0,
                    Calorie2 = 0,
                    Calorie3 = 0,
                    Calorie4 = 0
                });
            }

            // En fazla 5 menü döndür
            return menus.Take(5).ToList();
        }
    }
}
