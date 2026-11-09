
using System;

namespace IntranetAPI.DTOs;

public class CelebrationDTO
{
    public class BirthdayDTO
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        // DOĞUM TARİHİ
        public DateOnly BirthDate { get; set; }

        public string? ImageUrl { get; set; }



    }
    public class AnniversaryDTO
    {
        public string Id { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        // İŞE GİRİŞ TARİHİ
        public DateOnly HireDate { get; set; }

        public string? ImageUrl { get; set; }
    }
    public class WeeklyBirthdayDTO
    {
        public string Id { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public DateOnly BirthDate { get; set; }

        public string? ImageUrl { get; set; }
        public int DaysUntilBirthday { get; set; }
    }
    public class WeeklyAnniversaryDTO
    {
        public string Id { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public DateOnly HireDate { get; set; }

        public string? ImageUrl { get; set; }
        public int DaysUntilAnniversary { get; set; }
    }
}
