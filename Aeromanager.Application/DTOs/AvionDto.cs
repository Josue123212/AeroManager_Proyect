namespace Aeromanager.Application.DTOs;

public record AvionDto(
    int Id,
    string Matricula,
    int CapacidadFisica,
    string EstadoOperativo,
    int AerolineaId,
    int ModeloAvionId,
    DateTime FechaCreacion,
    bool Activo
);
