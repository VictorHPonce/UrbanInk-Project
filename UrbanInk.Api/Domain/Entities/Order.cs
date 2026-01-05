using System.ComponentModel.DataAnnotations.Schema;

namespace UrbanInk.Api.Domain.Entities
{
    public enum OrderStatus { Pending, Paid, Shipped, Delivered, Cancelled }

    public class Order
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        // --- RELACIÓN CON USUARIO ---
        // Corregido: Ahora es int? para coincidir con User.Id
        public int? UserId { get; set; }

        // Propiedad de navegación: Nos permite acceder a los datos del cliente registrado
        public User? User { get; set; }

        // Datos Snapshot (Se guardan aquí por si el usuario cambia su dirección luego)
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public string ShippingAddress { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string ZipCode { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;

        // Económicos
        [Column(TypeName = "decimal(18,2)")] public decimal SubTotal { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal ShippingCost { get; set; }
        [Column(TypeName = "decimal(18,2)")] public decimal Total { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.Pending;

        public List<OrderItem> Items { get; set; } = new();
    }
}