
using Microsoft.EntityFrameworkCore;
using IntranetAPI.Entities;

namespace IntranetAPI.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {

            // Örnek günlük yemek kombinasyonları
            var menus = new[]
            {
                ("Mercimek Çorbası", 150, "Tavuk Sote", 320, "Pirinç Pilavı", 240, "Cacık", 90),
                ("Ezogelin Çorbası", 160, "Kuru Fasulye", 300, "Bulgur Pilavı", 210, "Yoğurt", 100),
                ("Yayla Çorbası", 140, "İzmir Köfte", 350, "Pirinç Pilavı", 240, "Salata", 70),
                ("Domates Çorbası", 130, "Et Sote", 380, "Bulgur Pilavı", 210, "Ayran", 80),
                ("Tarhana Çorbası", 150, "Tavuk Haşlama", 280, "Makarna", 250, "Meyve", 90),
                ("Sebze Çorbası", 120, "Etli Nohut", 330, "Pirinç Pilavı", 240, "Cacık", 90),
                ("Mercimek Çorbası", 150, "Fırın Tavuk", 350, "Patates Püresi", 200, "Salata", 70),
                ("Şehriye Çorbası", 140, "Tas Kebabı", 390, "Bulgur Pilavı", 210, "Yoğurt", 100),
                ("Yayla Çorbası", 140, "Taze Fasulye", 220, "Pirinç Pilavı", 240, "Ayran", 80),
                ("Ezogelin Çorbası", 160, "Karnıyarık", 340, "Bulgur Pilavı", 210, "Cacık", 90)
            };

            // Bulunduğumuz takvim ayı
            var firstDay = new DateTime(
                DateTime.Today.Year,
                DateTime.Today.Month,
                1
            );

            var nextMonth = firstDay.AddMonths(1);

            bool menusExist = await context.FoodMenus
                .AnyAsync(x =>
                    x.MenuDate >= DateOnly.FromDateTime(firstDay) &&
                    x.MenuDate < DateOnly.FromDateTime(nextMonth));

            if (!menusExist)
            {
                int dayCount = DateTime.DaysInMonth(
                    firstDay.Year,
                    firstDay.Month
                );

                var foodMenus = new List<FoodMenu>();

                for (int i = 0; i < dayCount; i++)
                {
                    var menu = menus[i % menus.Length];

                    foodMenus.Add(new FoodMenu
                    {
                        MenuDate = DateOnly.FromDateTime(firstDay.AddDays(i)),

                        Food1 = menu.Item1,
                        Calorie1 = menu.Item2,

                        Food2 = menu.Item3,
                        Calorie2 = menu.Item4,

                        Food3 = menu.Item5,
                        Calorie3 = menu.Item6,

                        Food4 = menu.Item7,
                        Calorie4 = menu.Item8
                    });
                }

                await context.FoodMenus.AddRangeAsync(foodMenus);
            }

            await context.SaveChangesAsync();
        }
    }
}
