namespace Aeromanager.Application.DTOs;

public record ModeloAvionDto(
    int Id,
    string Fabricante,
    string NombreModelo,
    int CapacidadTeorica,
    int AutonomiaKm,
    DateTime FechaCreacion,
    bool Activo
);
