using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UrbanInk.Api.Domain.Entities
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = default!;

        [MaxLength(500)]
        public string? Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [MaxLength(255)]
        public string ImageUrl { get; set; } = string.Empty;

        [MaxLength(50)]
        public string Sku { get; set; } = string.Empty;

        public int Stock { get; set; }

        [MaxLength(50)]
        public string Category { get; set; } = "General";

        // Búsqueda: Palabras clave separadas por coma (ej: "calavera,negro,algodon")
        [MaxLength(200)]
        public string Tags { get; set; } = string.Empty;

        // Si es falso, el producto no sale en la tienda (Borrado lógico)
        public bool IsActive { get; set; } = true;

        // Para destacar productos en el Home o carruseles
        public bool IsFeatured { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}