

namespace IntranetAPI.Entities;

    public class Tenant
    {
        public int Id { get; set; } //Holdinglerin idsi burada tutulacak ve her holdingin verileri birbirlerinden izole edilecek

        public string Name { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
