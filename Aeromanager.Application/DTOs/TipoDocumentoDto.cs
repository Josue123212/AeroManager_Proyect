namespace Aeromanager.Application.DTOs;

public record TipoDocumentoDto(
    int Id,
    string Codigo,
    string Nombre,
    int LongitudMaxima,
    DateTime FechaCreacion,
    bool Activo
);
