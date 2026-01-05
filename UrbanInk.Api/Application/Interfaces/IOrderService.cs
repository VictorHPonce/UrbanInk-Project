using UrbanInk.Api.Application.DTOs.Order;
using UrbanInk.Api.Domain.Entities;

namespace UrbanInk.Api.Application.Interfaces
{
    public interface IOrderService
    {
        Task<Order> CreateOrderAsync(CreateOrderDto dto);
    }
}
