namespace Aeromanager.Application.DTOs;

public record VueloDto(
    int Id,
    string NumeroVuelo,
    int RutaId,
    int AvionId,
    int PuertaEmbarqueId,
    DateTime FechaHoraSalida,
    DateTime FechaHoraLlegada,
    int CapacidadVuelo,
    decimal PrecioBase,
    string Estado,
    DateTime FechaCreacion,
    bool Activo
);
