namespace Aeromanager.Application.DTOs;

public record CiudadDto(
    int Id,
    string Nombre,
    int PaisId,
    DateTime FechaCreacion,
    bool Activo
);
