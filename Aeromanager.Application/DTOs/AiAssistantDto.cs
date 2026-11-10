namespace Aeromanager.Application.DTOs;

public record AiAssistantRequestDto(string Pregunta);

public record AiAssistantResponseDto(
    string Pregunta,
    string Respuesta,
    DateTime FechaConsulta
);
