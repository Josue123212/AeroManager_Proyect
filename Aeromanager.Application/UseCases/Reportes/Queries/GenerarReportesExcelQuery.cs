using Aeromanager.Application.Interfaces;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Reportes.Queries;

public class GenerarReportesExcelQueryHandler(
    IVueloRepository vueloRepository,
    IReservaRepository reservaRepository,
    IPasajeroRepository pasajeroRepository,
    IExcelReportService excelReportService)
{
    public async Task<byte[]> ExportarVuelosExcelAsync(CancellationToken cancellationToken = default)
    {
        var vuelos = await vueloRepository.GetAllAsync();
        return excelReportService.GenerarReporteVuelosExcel(vuelos);
    }

    public async Task<byte[]> ExportarReservasExcelAsync(CancellationToken cancellationToken = default)
    {
        var reservas = await reservaRepository.GetAllAsync();
        return excelReportService.GenerarReporteReservasExcel(reservas);
    }

    public async Task<byte[]> ExportarPasajerosExcelAsync(CancellationToken cancellationToken = default)
    {
        var pasajeros = await pasajeroRepository.GetAllAsync();
        return excelReportService.GenerarReportePasajerosExcel(pasajeros);
    }
}
