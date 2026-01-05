using Microsoft.AspNetCore.Mvc;
using UrbanInk.Api.Application.DTOs.Order;
using UrbanInk.Api.Application.Interfaces;

namespace UrbanInk.Api.Controllers
{
    [ApiController]
    [Route("api/orders")]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // POST: api/orders
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            try
            {
                // Delegamos la lógica transaccional (ACID) al servicio
                var order = await _orderService.CreateOrderAsync(dto);

                // Retornamos éxito y el ID del pedido (útil para redirigir a "Gracias por su compra")
                return Ok(new
                {
                    message = "Pedido completado con éxito",
                    orderId = order.Id,
                    total = order.Total
                });
            }
            catch (Exception ex)
            {
                // Si el servicio lanza error (Stock insuficiente, regla de negocio),
                // devolvemos 400 Bad Request para que Angular muestre el mensaje al usuario.
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}