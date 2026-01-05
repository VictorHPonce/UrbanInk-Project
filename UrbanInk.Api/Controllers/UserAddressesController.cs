using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UrbanInk.Api.Application.DTOs.Address;
using UrbanInk.Api.Application.Interfaces;

namespace UrbanInk.Api.Controllers
{
    [Route("api/user/addresses")]
    [ApiController]
    [Authorize]
    public class UserAddressesController : ControllerBase
    {
        private readonly IAddressService _addressService;

        public UserAddressesController(IAddressService addressService)
        {
            _addressService = addressService;
        }

        [HttpGet]
        public async Task<ActionResult<List<AddressDto>>> GetMyAddresses()
        {
            var addresses = await _addressService.GetMyAddressesAsync();
            return Ok(addresses);
        }

        [HttpPost]
        public async Task<ActionResult<AddressDto>> Create([FromBody] CreateAddressDto dto)
        {
            var created = await _addressService.CreateAddressAsync(dto);
            return CreatedAtAction(nameof(GetMyAddresses), new { id = created.Id }, created);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var deleted = await _addressService.DeleteAddressAsync(id);
            if (!deleted) return NotFound(new { message = "Dirección no encontrada o no te pertenece" });

            return NoContent();
        }
    }
}