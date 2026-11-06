using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Services;

public class RutaDomainService
{
    public void ValidarReglasDeRuta(Ruta ruta)
    {
        if (ruta.AeropuertoOrigenId == ruta.AeropuertoDestinoId)
        {
            throw new InvalidOperationException("Regla de Dominio (Integridad de Trayecto): El aeropuerto de origen y el aeropuerto de destino no pueden ser el mismo.");
        }

        if (ruta.DistanciaKm <= 0)
        {
            throw new InvalidOperationException("Regla de Dominio: La distancia de la ruta en kilómetros debe ser estrictamente mayor a cero.");
        }

        if (ruta.DuracionEstimadaMinutos <= 0)
        {
            throw new InvalidOperationException("Regla de Dominio: La duración estimada de la ruta debe ser estrictamente mayor a cero.");
        }
    }
}
