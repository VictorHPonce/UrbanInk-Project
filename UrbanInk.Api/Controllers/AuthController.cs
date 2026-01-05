using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UrbanInk.Api.Application.Auth.Login;
using UrbanInk.Api.Domain.Entities;
using UrbanInk.Api.Infrastructure.Persistence;
using UrbanInk.Api.Infrastructure.Services;

namespace UrbanInk.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UrbanInkDbContext _db;
    private readonly IJwtTokenService _jwtService;
    // Inyectamos el mismo hasher que usamos en el Seeder
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthController(UrbanInkDbContext db, IJwtTokenService jwtService, IPasswordHasher<User> passwordHasher)
    {
        _db = db;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginRequestDto request)
    {
        // 1. Buscamos usuario
        var user = await _db.Users
            .Include(u => u.RefreshTokens)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        // 2. Validación de Usuario y Contraseña
        if (user is null) return Unauthorized(new { message = "Usuario no encontrado" });

        // USAMOS EL HASHER DE MICROSOFT
        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (result == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Contraseña incorrecta" });

        // 3. Generar Tokens
        var accessToken = _jwtService.GenerateAccessToken(user);
        var refreshToken = _jwtService.GenerateRefreshToken();

        // 4. Guardar Refresh Token
        var refreshTokenEntity = new RefreshToken
        {
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            UserId = user.Id
        };
        _db.RefreshTokens.Add(refreshTokenEntity);
        await _db.SaveChangesAsync();

        // 5. Retornar DTO actualizado (Con nombres)
        return Ok(BuildAuthResponse(user, accessToken, refreshToken));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh(RefreshTokenRequestDto request)
    {
        var refreshToken = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

        if (refreshToken is null || refreshToken.IsExpired || refreshToken.IsRevoked)
            return Unauthorized(new { message = "Token inválido o expirado" });

        var accessToken = _jwtService.GenerateAccessToken(refreshToken.User);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        refreshToken.IsRevoked = true;

        _db.RefreshTokens.Add(new RefreshToken
        {
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            UserId = refreshToken.UserId
        });

        await _db.SaveChangesAsync();

        // También aquí actualizamos el DTO con nombres
        var user = refreshToken.User;
        return Ok(BuildAuthResponse(user, accessToken, newRefreshToken));
    }

    private AuthResponseDto BuildAuthResponse(User user, string accessToken, string refreshToken)
    {
        // centralizamos la lógica de creación del DTO
        var userDto = new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            user.PhoneNumber 
        );

        return new AuthResponseDto(userDto, accessToken, refreshToken);
    }
}