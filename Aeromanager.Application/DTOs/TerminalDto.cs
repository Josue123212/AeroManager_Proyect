namespace Aeromanager.Application.DTOs;

public record TerminalDto(
    int Id,
    string Codigo,
    string Nombre,
    int AeropuertoId,
    DateTime FechaCreacion,
    bool Activo
);
