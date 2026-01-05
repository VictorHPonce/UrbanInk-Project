using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization; // Para evitar bucles infinitos al serializar

namespace UrbanInk.Api.Domain.Entities
{
    public class User
    {
        public int Id { get; set; }

        [MaxLength(100)] 
        public string FirstName { get; set; } = string.Empty;
        [MaxLength(100)] 
        public string LastName { get; set; } = string.Empty;

        [Required] 
        public string Email { get; set; } = null!;
        [JsonIgnore] 
        public string PasswordHash { get; set; } = null!; // Ocultamos pass
        public string Role { get; set; } = "USER";
        public string? PhoneNumber { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // --- RELACIONES (1 Usuario -> N Elementos) ---

        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        public ICollection<UserAddress> Addresses { get; set; } = new List<UserAddress>();

        // Historial de pedidos
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}