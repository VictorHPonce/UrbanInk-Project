namespace UrbanInk.Api.Application.Auth.Login
{
    public record AuthResponseDto(UserDto User, string AccessToken, string RefreshToken);

}
