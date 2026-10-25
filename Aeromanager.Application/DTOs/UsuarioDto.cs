namespace Aeromanager.Application.DTOs;

public record UsuarioDto(
    int Id,
    string NombreCompleto,
    string Email,
    string EstadoAcceso,
    DateTime FechaCreacion,
    bool Activo
);
