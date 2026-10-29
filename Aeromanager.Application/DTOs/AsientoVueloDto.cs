namespace Aeromanager.Application.DTOs;

public record AsientoVueloDto(
    int Id,
    int VueloId,
    int AsientoId,
    bool EstaOcupado,
    string EstadoConcurrencia,
    DateTime FechaActualizacion,
    bool Activo
);
