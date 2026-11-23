using Aeromanager.Application.UseCases.Reportes.Queries;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/reportes")]
public class ReportesController(GenerarReportesExcelQueryHandler reportesHandler) : ControllerBase
{
    private const string XlsxContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    [HttpGet("vuelos-excel")]
    public async Task<IActionResult> DescargarReporteVuelosExcel()
    {
        var bytes = await reportesHandler.ExportarVuelosExcelAsync();
        return File(bytes, XlsxContentType, $"Reporte_Vuelos_{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    [HttpGet("reservas-excel")]
    public async Task<IActionResult> DescargarReporteReservasExcel()
    {
        var bytes = await reportesHandler.ExportarReservasExcelAsync();
        return File(bytes, XlsxContentType, $"Reporte_Reservas_{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }

    [HttpGet("pasajeros-excel")]
    public async Task<IActionResult> DescargarReportePasajerosExcel()
    {
        var bytes = await reportesHandler.ExportarPasajerosExcelAsync();
        return File(bytes, XlsxContentType, $"Reporte_Pasajeros_{DateTime.UtcNow:yyyyMMdd}.xlsx");
    }
}