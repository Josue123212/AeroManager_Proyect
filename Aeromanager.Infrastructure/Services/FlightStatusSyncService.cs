using Aeromanager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Aeromanager.Infrastructure.Services;

/// <summary>
/// Motor operativo híbrido (AODB + RMS): avanza automáticamente los vuelos en flujo normal
/// según STD/STA respetando los overrides manuales (Retrasado, Cancelado, Aterrizado) y
/// sincroniza el estado de las Puertas de Embarque (Gates) con los vuelos en abordaje.
/// </summary>
public class FlightStatusSyncRunner
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<FlightStatusSyncRunner> _logger;
    private static readonly TimeSpan BoardingWindow = TimeSpan.FromMinutes(45);

    public FlightStatusSyncRunner(
        IServiceScopeFactory scopeFactory,
        ILogger<FlightStatusSyncRunner> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    public async Task SyncSafeAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AeroManagerDbContext>();

            var nowLocal = DateTime.Now;
            var vuelos = await db.Vuelo
                .Where(v => v.Activo)
                .ToListAsync(cancellationToken);

            var puertas = await db.PuertaEmbarque
                .Where(p => p.Activo)
                .ToListAsync(cancellationToken);

            var changed = false;

            foreach (var vuelo in vuelos)
            {
                if (IsManualOverrideOrFinal(vuelo.Estado))
                {
                    continue;
                }

                // Npgsql (EnableLegacyTimestampBehavior = true) persiste y lee timestamp without time zone en hora local del host
                var salida = vuelo.FechaHoraSalida;
                var llegada = vuelo.FechaHoraLlegada;

                string targetStatus;
                if (nowLocal >= llegada)
                {
                    targetStatus = "Aterrizado";
                }
                else if (nowLocal >= salida)
                {
                    targetStatus = "En Vuelo";
                }
                else if (nowLocal >= salida.Subtract(BoardingWindow))
                {
                    targetStatus = "En Abordaje";
                }
                else
                {
                    targetStatus = "Programado";
                }

                if (!string.Equals(vuelo.Estado, targetStatus, StringComparison.OrdinalIgnoreCase))
                {
                    vuelo.Estado = targetStatus;
                    changed = true;
                }
            }

            var boardingGateIds = vuelos
                .Where(v => v.Estado.Contains("ABORD", StringComparison.OrdinalIgnoreCase))
                .Select(v => v.PuertaEmbarqueId)
                .ToHashSet();

            foreach (var gate in puertas)
            {
                if (gate.Estado.Contains("MANTEN", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (boardingGateIds.Contains(gate.Id))
                {
                    if (!string.Equals(gate.Estado, "En Abordaje", StringComparison.OrdinalIgnoreCase))
                    {
                        gate.Estado = "En Abordaje";
                        changed = true;
                    }
                }
                else if (gate.Estado.Contains("ABORD", StringComparison.OrdinalIgnoreCase) ||
                         gate.Estado.Contains("OCUP", StringComparison.OrdinalIgnoreCase))
                {
                    gate.Estado = "Disponible";
                    changed = true;
                }
            }

            if (changed)
            {
                await db.SaveChangesAsync(cancellationToken);
            }
        }
        catch (OperationCanceledException)
        {
            // Apagado normal del host
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Error en la sincronización automática de estados de vuelos y gates.");
        }
    }

    private static bool IsManualOverrideOrFinal(string? estado)
    {
        if (string.IsNullOrWhiteSpace(estado)) return false;
        var up = estado.Trim().ToUpperInvariant();
        return up.Contains("RETRAS") ||
               up.Contains("DEMOR") ||
               up.Contains("CANCEL") ||
               up.Contains("ATERRIZ");
    }
}
