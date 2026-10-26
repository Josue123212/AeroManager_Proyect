namespace Aeromanager.Application.DTOs;

public record AeropuertoDto(
    int Id,
    string Nombre,
    string CodigoIata,
    int CiudadId,
    string? Direccion,
    DateTime FechaCreacion,
    bool Activo
);
