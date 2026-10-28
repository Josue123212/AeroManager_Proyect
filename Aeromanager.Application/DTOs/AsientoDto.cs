namespace Aeromanager.Application.DTOs;

public record AsientoDto(
    int Id,
    int Fila,
    string Letra,
    int AvionId,
    int ClaseAsientoId,
    DateTime FechaCreacion,
    bool Activo
);
