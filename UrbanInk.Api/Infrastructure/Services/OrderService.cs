using Microsoft.EntityFrameworkCore;
using UrbanInk.Api.Application.DTOs.Order;
using UrbanInk.Api.Application.Interfaces;
using UrbanInk.Api.Domain.Entities;
using UrbanInk.Api.Infrastructure.Persistence;

namespace UrbanInk.Api.Infrastructure.Services
{
    public class OrderService : IOrderService
    {
        private readonly UrbanInkDbContext _db;

        public OrderService(UrbanInkDbContext db)
        {
            _db = db;
        }

        public async Task<Order> CreateOrderAsync(CreateOrderDto dto)
        {
            // 1. INICIO DE TRANSACCIÓN (ACID)
            // Si algo falla en las siguientes 50 líneas, la BBDD vuelve a este punto exacto.
            using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                // A. Preparar la cabecera del pedido
                var order = new Order
                {
                    CustomerEmail = dto.CustomerEmail,
                    CustomerName = dto.CustomerName,
                    ShippingAddress = dto.Address,
                    City = dto.City,
                    ZipCode = dto.ZipCode,
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending
                };

                decimal subTotal = 0;

                // B. Procesar Items (Validar Stock y Calcular Precios Reales)
                foreach (var itemDto in dto.Items)
                {
                    // Buscamos el producto en BBDD (Bloqueando lectura si fuera muy high-traffic, pero asumo normal)
                    var product = await _db.Products.FindAsync(itemDto.ProductId);

                    if (product == null)
                        throw new Exception($"Producto {itemDto.ProductId} no existe.");

                    if (!product.IsActive)
                        throw new Exception($"El producto {product.Name} ya no está disponible.");

                    if (product.Stock < itemDto.Quantity)
                        throw new Exception($"Stock insuficiente para {product.Name}. Quedan {product.Stock}.");

                    // RESTA DE STOCK (Lo crítico)
                    product.Stock -= itemDto.Quantity;

                    // Creamos el OrderItem con el precio CONGELADO del momento
                    var orderItem = new OrderItem
                    {
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ProductImage = product.ImageUrl, // Snapshot de la imagen
                        Quantity = itemDto.Quantity,
                        UnitPrice = product.Price, // Precio de BBDD, no del DTO
                        Order = order
                    };

                    order.Items.Add(orderItem);
                    subTotal += orderItem.Total;
                }

                order.SubTotal = subTotal;

                // C. Calcular Envío (Lógica Dinámica desde BBDD)
                // Buscamos la regla activa (Aquí podrías filtrar por ZipCode si lo implementamos)
                var shippingRule = await _db.ShippingRules
                                            .FirstOrDefaultAsync(r => r.IsActive);
                // Ojo: en un sistema real elegirías la regla más adecuada

                decimal shippingCost = shippingRule?.Cost ?? 5.99m; // Fallback hardcodeado por seguridad

                // Regla de Envío Gratis
                if (shippingRule != null && shippingRule.FreeThreshold.HasValue)
                {
                    if (subTotal >= shippingRule.FreeThreshold.Value)
                    {
                        shippingCost = 0;
                    }
                }

                order.ShippingCost = shippingCost;
                order.Total = subTotal + shippingCost;

                // D. Guardar todo en BBDD
                _db.Orders.Add(order);
                await _db.SaveChangesAsync(); // Se guardan Order, OrderItems y se actualizan Products (Stock)

                // E. COMMIT DE TRANSACCIÓN
                // Si llegamos aquí, se confirma todo.
                await transaction.CommitAsync();

                return order;
            }
            catch (Exception)
            {
                // F. ROLLBACK
                // Si hubo error (ej: stock insuficiente), deshacemos TODOS los cambios
                await transaction.RollbackAsync();
                throw; // Re-lanzamos el error para que el Controller lo sepa
            }
        }
    }
}