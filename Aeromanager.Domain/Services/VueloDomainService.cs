using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Services;

public class VueloDomainService
{
    public void ValidarReglasDeVuelo(Vuelo vuelo)
    {
        if (vuelo.FechaHoraLlegada <= vuelo.FechaHoraSalida)
        {
            throw new InvalidOperationException("Regla de Dominio (Coherencia Cronológica): La fecha y hora de llegada debe ser estrictamente posterior a la fecha y hora de salida.");
        }

        if (vuelo.CapacidadVuelo <= 0)
        {
            throw new InvalidOperationException("Regla de Dominio (Restricción de Capacidad): La capacidad asignada al vuelo debe ser un entero mayor a cero.");
        }

        if (vuelo.PrecioBase <= 0)
        {
            throw new InvalidOperationException("Regla de Dominio: El precio base del vuelo debe ser mayor a cero.");
        }
    }
}
