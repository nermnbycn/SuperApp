
using System.Security.Claims;
using System.Text;

using IntranetAPI.Data;
using IntranetAPI.Entities;
using IntranetAPI.Interfaces;
using IntranetAPI.Services;
using IntranetAPI.Services.Interfaces;

using Microsoft.OpenApi;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// CONTROLLERS VE OPENAPI
// =====================================================

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();

// =====================================================
// SWAGGER
// =====================================================

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT tokenınızı giriniz."
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("bearer", document)] = []
        });
});

// =====================================================
// SQL SERVER
// =====================================================

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    );
});

// =====================================================
// ASP.NET CORE IDENTITY
// =====================================================

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;

        if (builder.Environment.IsDevelopment())
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 7;
        }

        options.Lockout.DefaultLockoutTimeSpan =
            TimeSpan.FromMinutes(15);

        options.Lockout.MaxFailedAccessAttempts = 5;

        options.Lockout.AllowedForNewUsers = true;
    })
    .AddEntityFrameworkStores<AppDbContext>()
    .AddSignInManager();

// =====================================================
// JWT AUTHENTICATION
// =====================================================

var jwtSettings = builder.Configuration.GetSection("Jwt");

var jwtKey = jwtSettings["Key"]
    ?? throw new InvalidOperationException(
        "JWT Key bulunamadı."
    );

var jwtIssuer = jwtSettings["Issuer"]
    ?? throw new InvalidOperationException(
        "JWT Issuer bulunamadı."
    );

var jwtAudience = jwtSettings["Audience"]
    ?? throw new InvalidOperationException(
        "JWT Audience bulunamadı."
    );

var jwtKeyBytes = Encoding.UTF8.GetBytes(jwtKey);

if (jwtKeyBytes.Length < 32)
{
    throw new InvalidOperationException(
        "JWT anahtarı en az 32 bayt olmalıdır."
    );
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;

        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(jwtKeyBytes),

                ValidateLifetime = true,

                ClockSkew = TimeSpan.FromSeconds(30),

                NameClaimType = ClaimTypes.NameIdentifier
            };
    });

var adminUserIds = builder.Configuration
    .GetSection("AdminAccess:UserIds")
    .Get<string[]>() ?? [];

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy =>
    {
        policy.RequireAuthenticatedUser();

        policy.RequireAssertion(context =>
        {
            var userId =
                context.User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? context.User.FindFirstValue("sub");

            return !string.IsNullOrEmpty(userId)
                && adminUserIds.Contains(userId);
        });
    });
});

// =====================================================
// APPLICATION SERVICES
// =====================================================

builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBlogService, BlogService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IGroupNewService, GroupNewService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IAdminUserService, AdminUserService>();

builder.Services.AddScoped<IAuthService, AuthService>();

// =====================================================
// APP BUILD
// =====================================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AdminDashboard", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var app = builder.Build();

// EF CORE MODEL KONTROLÜ


using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider
        .GetRequiredService<AppDbContext>();

    var connection = context.Database.GetDbConnection();

    Console.WriteLine("SQL SERVER: " + connection.DataSource);
    Console.WriteLine("VERİTABANI: " + connection.Database);
}

// =====================================================
// TEST VERİLERİ
// =====================================================

if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;

        var context = services
            .GetRequiredService<AppDbContext>();

        var userManager = services
            .GetRequiredService<UserManager<ApplicationUser>>();

        // Identity test kullanıcılarını oluştur
        await IdentitySeeder.SeedAsync(userManager);

        // Günlük yemek menülerini oluştur
        await DbSeeder.SeedAsync(context);
    }
}

// =====================================================
// DEVELOPMENT / SWAGGER
// =====================================================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    app.UseSwagger();

    app.UseSwaggerUI();
}

// =====================================================
// MIDDLEWARE
// =====================================================

app.UseHttpsRedirection();

app.UseStaticFiles();
app.UseCors("AdminDashboard");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// =====================================================
// TEST ŞİFRELERİNİ SIFIRLAMA
// =====================================================

// Yalnızca geliştirme ortamında ve
// RESET_TEST_PASSWORDS=1 olduğunda çalışır.

if (app.Environment.IsDevelopment() &&
    Environment.GetEnvironmentVariable("RESET_TEST_PASSWORDS") == "1")
{
    try
    {
        using var scope = app.Services.CreateScope();

        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<ApplicationUser>>();

        var users = userManager.Users.ToList();

        foreach (var user in users)
        {
            user.PasswordHash = userManager.PasswordHasher
                .HashPassword(user, "test123");

            user.SecurityStamp = Guid.NewGuid().ToString();

            var result = await userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                Console.WriteLine(
                    $"Şifre güncellendi: {user.Email}"
                );
            }
            else
            {
                Console.WriteLine(
                    $"HATA ({user.Email}): " +
                    string.Join(", ",
                        result.Errors.Select(e => e.Description))
                );
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine(
            "Test şifre sıfırlama hatası: " + ex.Message
        );
    }
}

// =====================================================
// APPLICATION START
// =====================================================

app.Run();
