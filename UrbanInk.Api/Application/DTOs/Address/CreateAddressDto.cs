using UrbanInk.Api.Domain.Entities; // Para el Enum

namespace UrbanInk.Api.Application.DTOs.Address
{
    // Usamos record. IsDefault es bool.
    public record CreateAddressDto(
        UserAddressAlias Alias,
        string Street,
        string City,
        string PostalCode,
        string Country,
        bool IsDefault
    );
}