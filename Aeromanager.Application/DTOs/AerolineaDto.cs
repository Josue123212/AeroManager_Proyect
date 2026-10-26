namespace Aeromanager.Application.DTOs;

public record AerolineaDto(
    int Id,
    string Nombre,
    string CodigoIata,
    int PaisOrigenId,
    DateTime FechaCreacion,
    bool Activo
);
