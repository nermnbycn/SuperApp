
namespace IntranetAPI.DTOs;

public class CelebrationDTO
{
    public class BirthdayDTO
    {
        public string Id { get; set; } = string.Empty;
        public string NameSurname { get; set; } = string.Empty;
        public DateOnly DateofBirth { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class AnniversaryDTO
    {
        public string Id { get; set; } = string.Empty;
        public string NameSurname { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public string? ImageUrl { get; set; }
    }

    public class WeeklyBirthdayDTO
    {
        public string Id { get; set; } = string.Empty;
        public string NameSurname { get; set; } = string.Empty;
        public DateOnly DateofBirth { get; set; }
        public string? ImageUrl { get; set; }
        public int DaysUntilBirthday { get; set; }
    }

    public class WeeklyAnniversaryDTO
    {
        public string Id { get; set; } = string.Empty;
        public string NameSurname { get; set; } = string.Empty;
        public DateOnly StartDate { get; set; }
        public string? ImageUrl { get; set; }
        public int DaysUntilAnniversary { get; set; }
    }
}
