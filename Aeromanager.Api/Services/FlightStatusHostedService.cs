using Aeromanager.Infrastructure.Services;

namespace Aeromanager.Api.Services;

/// <summary>
/// Servicio en segundo plano que ejecuta cada 30 segundos la sincronización
/// automática de estados de vuelos y puertas de embarque.
/// </summary>
public class FlightStatusHostedService : BackgroundService
{
    private readonly FlightStatusSyncRunner _runner;
    private static readonly TimeSpan SyncInterval = TimeSpan.FromSeconds(30);

    public FlightStatusHostedService(FlightStatusSyncRunner runner)
    {
        _runner = runner;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        try
        {
            await Task.Delay(TimeSpan.FromSeconds(4), stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        await _runner.SyncSafeAsync(stoppingToken);

        using var timer = new PeriodicTimer(SyncInterval);
        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            await _runner.SyncSafeAsync(stoppingToken);
        }
    }
}
