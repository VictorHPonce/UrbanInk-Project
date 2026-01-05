namespace UrbanInk.Api.Application.Auth.Login
{
    public record UserDto(int Id, string Email, string FirstName, string LastName, string Role, string? PhoneNumber);
}