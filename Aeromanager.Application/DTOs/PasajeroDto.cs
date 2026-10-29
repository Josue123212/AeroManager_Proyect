namespace Aeromanager.Application.DTOs;

public record PasajeroDto(
    int Id,
    string Nombres,
    string Apellidos,
    int TipoDocumentoId,
    string NumeroDocumento,
    string Email,
    string? Telefono,
    int NacionalidadPaisId,
    DateTime FechaCreacion,
    bool Activo
);
