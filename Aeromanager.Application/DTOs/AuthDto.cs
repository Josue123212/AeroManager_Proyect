namespace Aeromanager.Application.DTOs;

public record LoginRequestDto(string Email, string Password);

public record LoginResponseDto(
    int Id,
    string NombreCompleto,
    string Email,
    string Token,
    IEnumerable<string> Roles
);
