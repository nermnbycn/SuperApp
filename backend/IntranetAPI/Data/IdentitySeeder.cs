using IntranetAPI.Entities;
using Microsoft.AspNetCore.Identity;

namespace IntranetAPI.Data;

public static class IdentitySeeder
{
    public static async Task SeedAsync(
        UserManager<ApplicationUser> userManager)
    {
        for (int i = 1; i <= 30; i++)
        {
            string email = $"test{i}.yazilim@gmail.com";

            if (await userManager.FindByEmailAsync(email) != null)
                continue;

            var user = new ApplicationUser
            {
                FirstName = "Test",
                LastName = $"Kullanıcı {i}",
                Email = email,
                UserName = email,
                EmailConfirmed = true,
                BirthDate = new DateOnly(
                    1990 + i % 15, 1 + i % 12, 1 + i % 28),
                HireDate = new DateOnly(
                    2020 + i % 6, 1 + i % 12, 1 + i % 28)
            };

            var result = await userManager.CreateAsync(
                user, "test123");

            if (!result.Succeeded)
            {
                throw new Exception(string.Join(
                    ", ",
                    result.Errors.Select(e => e.Description)
                ));
            }
        }
    }
}