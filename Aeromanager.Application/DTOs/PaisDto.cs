namespace Aeromanager.Application.DTOs;

public record PaisDto(
    int Id,
    string Nombre,
    string CodigoIso,
    DateTime FechaCreacion,
    bool Activo
);
