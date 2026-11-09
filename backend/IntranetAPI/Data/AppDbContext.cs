
using Microsoft.EntityFrameworkCore;
using IntranetAPI.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace IntranetAPI.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<FoodMenu> FoodMenus { get; set; }
        public DbSet<Blog> Blogs { get; set; }
        public DbSet<BlogCategory> BlogCategories { get; set; }
        public DbSet<BlogFavorites> BlogFavorites { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<GroupNewCompany> GroupNewCompanies { get; set; }
        public DbSet<GroupNew> GroupNews { get; set; }
        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<AnnouncementCompany> AnnouncementCompanies { get; set; }
        public DbSet<CelebrationMessage> CelebrationMessages { get; set; }
        public DbSet<Tenant> Tenants { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<CelebrationMessage>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<CelebrationMessage>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
