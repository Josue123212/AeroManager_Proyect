namespace Aeromanager.Application.DTOs;

public record RolDto(
    int Id,
    string Nombre,
    string? Descripcion,
    DateTime FechaCreacion,
    bool Activo
);
