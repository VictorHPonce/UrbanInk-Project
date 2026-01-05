using System.ComponentModel.DataAnnotations.Schema; // Para [ForeignKey]
using System.Text.Json.Serialization; // Opcional: Para evitar ciclos infinitos al serializar

namespace UrbanInk.Api.Domain.Entities
{
    public enum UserAddressAlias
    {
        Home,
        Work,
        Other
    }

    public class UserAddress
    {
        public int Id { get; set; }
        public int UserId { get; set; } // FK

        [JsonIgnore]
        public User User { get; set; } = null!; // Navegación

        public UserAddressAlias Alias { get; set; } = UserAddressAlias.Home;
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string PostalCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public bool IsDefault { get; set; } = false;
    }
}