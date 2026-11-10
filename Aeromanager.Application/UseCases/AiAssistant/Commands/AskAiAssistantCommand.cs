using Aeromanager.Application.DTOs;
using Aeromanager.Application.Interfaces;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.AiAssistant.Commands;

public record AskAiAssistantCommand(string Pregunta);

public class AskAiAssistantCommandHandler(
    IAeropuertoRepository aeropuertoRepository,
    IVueloRepository vueloRepository,
    IReservaRepository reservaRepository,
    IAvionRepository avionRepository,
    IAiAssistantService aiAssistantService)
{
    public async Task<AiAssistantResponseDto> Handle(AskAiAssistantCommand command, CancellationToken cancellationToken = default)
    {
        var aeropuertos = (await aeropuertoRepository.GetAllAsync()).Count(x => x.Activo);
        var aviones = (await avionRepository.GetAllAsync()).Count(x => x.Activo);
        var vuelos = (await vueloRepository.GetAllAsync()).Where(x => x.Activo).ToList();
        var reservas = (await reservaRepository.GetAllAsync()).Where(x => x.Activo).ToList();

        var contexto = $"Estado actual en Neon Cloud DB: {aeropuertos} sedes aeroportuarias IATA activas, " +
                       $"{aviones} aeronaves en flota, {vuelos.Count} vuelos programados, " +
                       $"{reservas.Count} reservas confirmadas (${reservas.Sum(r => r.MontoTotal):N2} USD).";

        var respuesta = await aiAssistantService.ConsultarAsistenteOperativoAsync(command.Pregunta, contexto);

        return new AiAssistantResponseDto(
            command.Pregunta,
            respuesta,
            DateTime.UtcNow
        );
    }
}
