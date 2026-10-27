namespace Aeromanager.Application.DTOs;

public record PuertaEmbarqueDto(
    int Id,
    string CodigoGate,
    string Estado,
    int TerminalId,
    DateTime FechaCreacion,
    bool Activo
);
