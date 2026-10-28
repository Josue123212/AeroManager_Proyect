namespace Aeromanager.Application.DTOs;

public record RutaDto(
    int Id,
    string CodigoRuta,
    int AeropuertoOrigenId,
    int AeropuertoDestinoId,
    int DistanciaKm,
    int DuracionEstimadaMinutos,
    DateTime FechaCreacion,
    bool Activo
);
