using System.ComponentModel.DataAnnotations.Schema;

namespace UrbanInk.Api.Domain.Entities
{
    public class ShippingRule
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty; // "Standard", "Express"

        [Column(TypeName = "decimal(18,2)")]
        public decimal Cost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? FreeThreshold { get; set; } // Null = Nunca es gratis

        public bool IsActive { get; set; } = true;
    }
}