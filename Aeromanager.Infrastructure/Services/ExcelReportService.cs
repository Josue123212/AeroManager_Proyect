using System.Text;
using Aeromanager.Application.Interfaces;
using Aeromanager.Domain.Entities;

namespace Aeromanager.Infrastructure.Services;

public class ExcelReportService : IExcelReportService
{
    public byte[] GenerarReporteVuelosExcel(IEnumerable<Vuelo> vuelos)
    {
        var sb = new StringBuilder();
        sb.AppendLine("ID\tNumeroVuelo\tRutaId\tAvionId\tPuertaEmbarqueId\tFechaHoraSalida\tFechaHoraLlegada\tCapacidadVuelo\tPrecioBaseUSD\tEstado\tActivo");
        foreach (var v in vuelos)
        {
            sb.AppendLine($"{v.Id}\t{v.NumeroVuelo}\t{v.RutaId}\t{v.AvionId}\t{v.PuertaEmbarqueId}\t{v.FechaHoraSalida:yyyy-MM-dd HH:mm}\t{v.FechaHoraLlegada:yyyy-MM-dd HH:mm}\t{v.CapacidadVuelo}\t{v.PrecioBase:F2}\t{v.Estado}\t{v.Activo}");
        }
        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
    }

    public byte[] GenerarReporteReservasExcel(IEnumerable<Reserva> reservas)
    {
        var sb = new StringBuilder();
        sb.AppendLine("ID\tCodigoTicket\tVueloId\tUsuarioRegistroId\tFechaReserva\tMontoTotalUSD\tEstadoReserva\tActivo");
        foreach (var r in reservas)
        {
            sb.AppendLine($"{r.Id}\t{r.CodigoTicket}\t{r.VueloId}\t{r.UsuarioRegistroId}\t{r.FechaReserva:yyyy-MM-dd HH:mm}\t{r.MontoTotal:F2}\t{r.EstadoReserva}\t{r.Activo}");
        }
        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
    }

    public byte[] GenerarReportePasajerosExcel(IEnumerable<Pasajero> pasajeros)
    {
        var sb = new StringBuilder();
        sb.AppendLine("ID\tNombres\tApellidos\tTipoDocumentoId\tNumeroDocumento\tEmail\tTelefono\tNacionalidadPaisId\tActivo");
        foreach (var p in pasajeros)
        {
            sb.AppendLine($"{p.Id}\t{p.Nombres}\t{p.Apellidos}\t{p.TipoDocumentoId}\t{p.NumeroDocumento}\t{p.Email}\t{p.Telefono}\t{p.NacionalidadPaisId}\t{p.Activo}");
        }
        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
    }
}
