using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UrbanInk.Api.Application.DTOs.Address;
using UrbanInk.Api.Application.Interfaces;
using UrbanInk.Api.Domain.Entities;
using UrbanInk.Api.Infrastructure.Persistence;

namespace UrbanInk.Api.Infrastructure.Services
{
    public class AddressService : IAddressService
    {
        private readonly UrbanInkDbContext _db;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AddressService(UrbanInkDbContext db, IHttpContextAccessor httpContextAccessor)
        {
            _db = db;
            _httpContextAccessor = httpContextAccessor;
        }

        // ==========================================================
        // 1. OBTENER MIS DIRECCIONES
        // ==========================================================
        public async Task<List<AddressDto>> GetMyAddressesAsync()
        {
            var userId = GetCurrentUserId();

            // Buscamos en BBDD solo las de este usuario
            var addresses = await _db.UserAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault) // La favorita primero
                .ToListAsync();

            // Convertimos Entidad -> DTO
            return addresses.Select(a => new AddressDto(
                a.Id, a.Alias, a.Street, a.City, a.PostalCode, a.Country, a.IsDefault
            )).ToList();
        }

        // ==========================================================
        // 2. CREAR DIRECCIÓN (Con lógica de negocio)
        // ==========================================================
        public async Task<AddressDto> CreateAddressAsync(CreateAddressDto dto)
        {
            var userId = GetCurrentUserId();

            // LÓGICA: Si el usuario dice que esta es la "Default",
            // tenemos que quitarle el "Default" a las que ya tenga.
            if (dto.IsDefault)
            {
                var existingDefaults = await _db.UserAddresses
                    .Where(a => a.UserId == userId && a.IsDefault)
                    .ToListAsync();

                foreach (var address in existingDefaults)
                {
                    address.IsDefault = false;
                }
                // No hace falta SaveChanges aquí, se hará al final todo junto
            }

            // Mapeamos DTO -> Entidad
            var newAddress = new UserAddress
            {
                UserId = userId,
                Alias = dto.Alias,
                Street = dto.Street,
                City = dto.City,
                PostalCode = dto.PostalCode,
                Country = dto.Country,
                IsDefault = dto.IsDefault
            };

            _db.UserAddresses.Add(newAddress);
            await _db.SaveChangesAsync(); // Aquí se guardan los cambios de Default y la nueva

            // Devolvemos el DTO con el ID generado
            return new AddressDto(
                newAddress.Id, newAddress.Alias, newAddress.Street,
                newAddress.City, newAddress.PostalCode, newAddress.Country, newAddress.IsDefault
            );
        }

        // ==========================================================
        // 3. BORRAR DIRECCIÓN (Con seguridad)
        // ==========================================================
        public async Task<bool> DeleteAddressAsync(int addressId)
        {
            var userId = GetCurrentUserId();

            // SEGURIDAD: Buscamos por ID de dirección Y por ID de usuario.
            // Así evitamos que un usuario borre la dirección de otro cambiando el ID.
            var address = await _db.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId);

            if (address == null) return false; // No existe o no es tuya

            _db.UserAddresses.Remove(address);
            await _db.SaveChangesAsync();
            return true;
        }

        // ==========================================================
        // HELPER PRIVADO (Dentro de la clase)
        // ==========================================================
        private int GetCurrentUserId()
        {
            var idClaim = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier);

            if (idClaim == null)
                throw new UnauthorizedAccessException("Usuario no autenticado.");

            return int.Parse(idClaim.Value);
        }
    }
}