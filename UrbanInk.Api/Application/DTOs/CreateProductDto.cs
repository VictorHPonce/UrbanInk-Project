using Microsoft.AspNetCore.Http;

namespace UrbanInk.Api.Application.DTOs
{
    public class CreateProductDto
    {
        public string Name { get; set; } = default!;
        public string Description { get; set; } = default!;
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public string Category { get; set; } = default!;

        // AQUÍ LLEGA LA IMAGEN BINARIA DESDE ANGULAR
        public IFormFile? Image { get; set; }
    }
}