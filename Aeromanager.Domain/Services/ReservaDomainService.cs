using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Services;

public class ReservaDomainService
{
    public void ValidarAsignacionDeAsiento(AsientoVuelo asientoVuelo, decimal precioUnitario)
    {
        if (!asientoVuelo.Activo)
        {
            throw new InvalidOperationException("Regla de Dominio: El asiento seleccionado no se encuentra habilitado para este vuelo.");
        }

        if (asientoVuelo.EstaOcupado)
        {
            throw new InvalidOperationException("Regla de Dominio (Control Anti-Solapamiento): El asiento físico seleccionado ya está ocupado por otro pasajero en este vuelo.");
        }

        if (precioUnitario <= 0)
        {
            throw new InvalidOperationException("Regla de Dominio: El precio unitario del asiento reservado debe ser mayor a cero.");
        }
    }
}
