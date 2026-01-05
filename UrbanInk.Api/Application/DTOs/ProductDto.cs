namespace UrbanInk.Api.Application.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = default!;
        public string Category { get; set; } = default!;

        // Lógica para el Frontend
        public bool IsAvailable { get; set; } // Stock > 0
        public bool IsActive { get; set; }
        public int Stock { get; set; }        // Para mostrar "¡Quedan 2!"
        public bool IsNew { get; set; }       // Calculado por fecha
        public bool IsFeatured { get; set; }
    }
}