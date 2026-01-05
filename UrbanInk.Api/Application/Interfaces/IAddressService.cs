using UrbanInk.Api.Application.DTOs.Address;

namespace UrbanInk.Api.Application.Interfaces
{
    public interface IAddressService
    {
        // Devuelve todas las direcciones del usuario logueado
        Task<List<AddressDto>> GetMyAddressesAsync();

        // Crea una nueva
        Task<AddressDto> CreateAddressAsync(CreateAddressDto dto);

        // Borra una (solo si pertenece al usuario)
        Task<bool> DeleteAddressAsync(int addressId);
    }
}
