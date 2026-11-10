
using Microsoft.AspNetCore.Identity;

namespace IntranetAPI.Data;

public static class IdentitySeeder
{
    public static async Task SeedAsync(
        UserManager<ApplicationUser> userManager)
    {
        // ==========================================
        // 30 TEST KULLANICISI
        // ==========================================

        for (int i = 1; i <= 30; i++)
        {
            string email = $"test{i}.yazilim@gmail.com";

            var existingUser =
                await userManager.FindByEmailAsync(email);

            if (existingUser != null)
                continue;

            var user = new ApplicationUser
            {
                NameSurname = $"Test Kullanıcı {i}",

                Email = email,
                UserName = email,
                EmailConfirmed = true,

                DateofBirth = new DateOnly(
                    1990 + i % 15,
                    1 + i % 12,
                    1 + i % 28
                ),

                StartDate = new DateOnly(
                    2020 + i % 6,
                    1 + i % 12,
                    1 + i % 28
                ),

                IsDeleted = false,
                CreateTime = DateTime.UtcNow
            };

            var result = await userManager.CreateAsync(
                user,
                "test123"
            );

            if (!result.Succeeded)
            {
                throw new Exception(
                    $"Test kullanıcısı oluşturulamadı ({email}): " +
                    string.Join(", ",
                        result.Errors.Select(e => e.Description))
                );
            }
        }

        // ==========================================
        // ADMIN KULLANICISI - NERMİN BAYCAN
        // ==========================================

        const string adminEmail = "nermin.baycan@bize.com";

        var admin = await userManager.FindByEmailAsync(adminEmail);

        if (admin == null)
        {
            admin = new ApplicationUser
            {
                NameSurname = "Nermin Baycan",

                Email = adminEmail,
                UserName = adminEmail,
                EmailConfirmed = true,

                IsDeleted = false,
                IsManager = true,

                CreateTime = DateTime.UtcNow,
                CreatedBy = "System"
            };

            var result = await userManager.CreateAsync(
                admin,
                "test123"
            );

            if (!result.Succeeded)
            {
                throw new Exception(
                    "Admin kullanıcısı oluşturulamadı: " +
                    string.Join(", ",
                        result.Errors.Select(e => e.Description))
                );
            }
        }
    }
}
