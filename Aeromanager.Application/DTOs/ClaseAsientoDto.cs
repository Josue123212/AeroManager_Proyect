namespace Aeromanager.Application.DTOs;

public record ClaseAsientoDto(
    int Id,
    string Nombre,
    decimal MultiplicadorTarifa,
    DateTime FechaCreacion,
    bool Activo
);
