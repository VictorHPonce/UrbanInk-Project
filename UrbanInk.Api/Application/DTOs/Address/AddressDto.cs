using UrbanInk.Api.Domain.Entities;

namespace UrbanInk.Api.Application.DTOs.Address
{
    // Lo que devolvemos al frontend (incluye el ID)
    public record AddressDto(
        int Id,
        UserAddressAlias Alias,
        string Street,
        string City,
        string PostalCode,
        string Country,
        bool IsDefault
    );
}