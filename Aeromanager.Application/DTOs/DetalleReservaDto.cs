namespace Aeromanager.Application.DTOs;

public record DetalleReservaDto(
    int Id,
    int ReservaId,
    int PasajeroId,
    int AsientoVueloId,
    decimal PrecioUnitario,
    DateTime FechaCreacion,
    bool Activo
);
