
using System.Security.Claims;
using System.Text;

using IntranetAPI.Data;
using IntranetAPI.Entities;
using IntranetAPI.Interfaces;
using IntranetAPI.Services;
using Microsoft.OpenApi;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using IntranetAPI.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// =====================================================
// CONTROLLERS VE OPENAPI
// =====================================================

builder.Services.AddControllers();
builder.Services.AddOpenApi();


// =====================================================
// SWAGGER
// =====================================================

builder.Services.AddEndpointsApiExplorer();



builder.Services.AddSwaggerGen(options =>
{
    // JWT Bearer tanımı
    options.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT tokenınızı giriniz."
    });

    // Swagger isteklerine JWT eklenmesini sağlar
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
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        )
    );
});


// =====================================================
// ASP.NET CORE IDENTITY
// =====================================================

builder.Services
    .AddIdentityCore<ApplicationUser>(options =>
    {
        // Kullanıcılar e-posta ile giriş yapacak.
        options.User.RequireUniqueEmail = true;

        // Şifre kuralları
        if (builder.Environment.IsDevelopment())
        {
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 7;
        }

        // Yanlış giriş denemeleri
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

// Şu an appsettings.json içindeki düz metin anahtarla uyumlu.
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
                // Tokenı oluşturan servis
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                // Tokenın hedefi
                ValidateAudience = true,
                ValidAudience = jwtAudience,

                // İmza doğrulaması
                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(jwtKeyBytes),

                // Token süresi
                ValidateLifetime = true,

                ClockSkew = TimeSpan.FromSeconds(30),

                // Identity kullanıcı ID claim'i
                NameClaimType = ClaimTypes.NameIdentifier
            };
    });

builder.Services.AddAuthorization();


// =====================================================
// APPLICATION SERVICES
// =====================================================

// Mevcut servisler
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IBlogService, BlogService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IProfileService, ProfileService>();
builder.Services.AddScoped<IGroupNewService, GroupNewService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<IMessageService, MessageService>();

// Yeni giriş servisi
builder.Services.AddScoped<IAuthService, AuthService>();


// =====================================================
// APP BUILD
// =====================================================

var app = builder.Build();


// =====================================================
// TEST VERİLERİ
// =====================================================


if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;

        var userManager = services
            .GetRequiredService<UserManager<ApplicationUser>>();

        // Yeni Identity test kullanıcılarını oluştur.
        await IdentitySeeder.SeedAsync(userManager);
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();


// =====================================================
// CONTROLLERS
// =====================================================

app.MapControllers();


// =====================================================
// APPLICATION START
// =====================================================

// YALNIZCA GELİŞTİRME ORTAMINDA TEST ŞİFRELERİNİ SIFIRLA
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
                    $"Şifre güncellendi: {user.Email}");
            }
            else
            {
                Console.WriteLine(
                    $"HATA ({user.Email}): " +
                    string.Join(", ",
                        result.Errors.Select(e => e.Description)));
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine(
            "Test şifre sıfırlama hatası: " + ex.Message);
    }
}
app.Run();
