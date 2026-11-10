using Aeromanager.Domain.Entities;

namespace Aeromanager.Application.Interfaces;

public interface IExcelReportService
{
    byte[] GenerarReporteVuelosExcel(IEnumerable<Vuelo> vuelos);
    byte[] GenerarReporteReservasExcel(IEnumerable<Reserva> reservas);
    byte[] GenerarReportePasajerosExcel(IEnumerable<Pasajero> pasajeros);
}
