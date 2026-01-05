using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UrbanInk.Api.Application.DTOs;
using UrbanInk.Api.Application.Interfaces; // Importante para IFileStorageService
using UrbanInk.Api.Domain.Entities;
using UrbanInk.Api.Infrastructure.Persistence;

namespace UrbanInk.Api.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly UrbanInkDbContext _db;
        private readonly IFileStorageService _fileStorage; // Inyección del servicio
        private readonly string containerName = "images/products"; // Carpeta destino

        public ProductsController(UrbanInkDbContext db, IFileStorageService fileStorage)
        {
            _db = db;
            _fileStorage = fileStorage;
        }

        #region 1. Public Endpoints (Tienda)

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            var thresholdDate = DateTime.UtcNow.AddDays(-30);

            var products = await _db.Products
                                    .AsNoTracking()
                                    .Where(p => p.IsActive)
                                    .OrderByDescending(p => p.CreatedAt)
                                    .ToListAsync();

            var dtos = products.Select(p => MapToDto(p, thresholdDate));
            return Ok(dtos);
        }

        // GET: api/products/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProductById(int id)
        {
            var product = await _db.Products.FindAsync(id);

            if (product == null || !product.IsActive)
            {
                return NotFound(new { message = "Producto no encontrado." });
            }

            var thresholdDate = DateTime.UtcNow.AddDays(-30);
            return Ok(MapToDto(product, thresholdDate));
        }

        #endregion

        #region 2. Admin Read Endpoints (Gestión)

        // GET: api/products/manage
        [HttpGet("manage")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<PagedResponse<ProductDto>>> GetProductsManage(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null)
        {
            var query = _db.Products.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(p =>
                    p.Name.ToLower().Contains(search) ||
                    p.Sku.ToLower().Contains(search));
            }

            var totalItems = await query.CountAsync();
            var products = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var thresholdDate = DateTime.UtcNow.AddDays(-30);
            var dtos = products.Select(p => MapToDto(p, thresholdDate));

            return Ok(new PagedResponse<ProductDto>
            {
                Items = dtos,
                TotalItems = totalItems,
                Page = page,
                PageSize = pageSize
            });
        }

        // GET: api/products/manage/{id}
        [HttpGet("manage/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ProductDto>> GetProductByIdAdmin(int id)
        {
            var product = await _db.Products.FindAsync(id);

            if (product == null) return NotFound(new { message = "Producto no encontrado." });

            var thresholdDate = DateTime.UtcNow.AddDays(-30);
            return Ok(MapToDto(product, thresholdDate));
        }

        #endregion

        #region 3. Admin Write Endpoints (Escritura)

        // POST: api/products
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromForm] CreateProductDto dto)
        {
            if (dto.Price < 0) return BadRequest("El precio no puede ser negativo.");

            // 1. Gestión de Imagen con Servicio PRO
            string imageUrl = null ?? String.Empty;

            if (dto.Image != null)
            {
                // Delegamos la complejidad al servicio
                imageUrl = await _fileStorage.SaveFileAsync(dto.Image, containerName);
            }
            else
            {
                imageUrl = "/assets/products/placeholder.png"; // Fallback
            }

            // 2. Crear Entidad
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                Stock = dto.Stock,
                Category = dto.Category,
                ImageUrl = imageUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Products.Add(product);
            await _db.SaveChangesAsync();

            var thresholdDate = DateTime.UtcNow.AddDays(-30);
            return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, MapToDto(product, thresholdDate));
        }

        // PUT: api/products/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromForm] CreateProductDto dto)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            // Actualizar campos
            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.Category = dto.Category;

            // 3. Actualizar Imagen (Inteligente)
            if (dto.Image != null)
            {
                // A) Borramos la vieja si no es la default
                if (!string.IsNullOrEmpty(product.ImageUrl) && !product.ImageUrl.Contains("placeholder"))
                {
                    await _fileStorage.DeleteFileAsync(product.ImageUrl, containerName);
                }

                // B) Guardamos la nueva
                product.ImageUrl = await _fileStorage.SaveFileAsync(dto.Image, containerName);
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Producto actualizado correctamente" });
        }

        // PATCH: api/products/{id}/status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var product = await _db.Products.FindAsync(id);
            if (product == null) return NotFound();

            product.IsActive = dto.IsActive;
            await _db.SaveChangesAsync();

            return NoContent();
        }

        #endregion

        #region 4. Helpers

        // Mapeo Centralizado Entidad -> DTO
        private static ProductDto MapToDto(Product p, DateTime thresholdDate)
        {
            return new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description ?? string.Empty,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                Category = p.Category,
                Stock = p.Stock,
                IsFeatured = p.IsFeatured,
                IsNew = p.CreatedAt > thresholdDate,
                IsAvailable = p.Stock > 0, // Stock disponible
                IsActive = p.IsActive      // Interruptor admin
            };
        }

        public class StatusUpdateDto
        {
            public bool IsActive { get; set; }
        }

        #endregion
    }
}