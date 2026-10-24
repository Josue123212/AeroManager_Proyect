using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class DetalleReserva
{
    public int Id { get; set; }

    public int ReservaId { get; set; }

    public int PasajeroId { get; set; }

    public int AsientoVueloId { get; set; }

    public decimal PrecioUnitario { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual AsientoVuelo AsientoVuelo { get; set; } = null!;

    public virtual Pasajero Pasajero { get; set; } = null!;

    public virtual Reserva Reserva { get; set; } = null!;
}
