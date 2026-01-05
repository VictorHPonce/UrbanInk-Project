using System.ComponentModel.DataAnnotations.Schema;

namespace UrbanInk.Api.Domain.Entities
{
    public class OrderItem
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public Order Order { get; set; } = null!;

        public int ProductId { get; set; } // Guardamos ID por referencia

        // Guardamos SNAPSHOT de datos críticos (Si el producto se borra o cambia nombre)
        public string ProductName { get; set; } = string.Empty;
        public string ProductImage { get; set; } = string.Empty;

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; } // Precio al momento de la compra

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total => UnitPrice * Quantity;
    }
}