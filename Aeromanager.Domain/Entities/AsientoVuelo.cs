using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class AsientoVuelo
{
    public int Id { get; set; }

    public int VueloId { get; set; }

    public int AsientoId { get; set; }

    public bool EstaOcupado { get; set; }

    public string EstadoConcurrencia { get; set; } = null!;

    public DateTime FechaActualizacion { get; set; }

    public bool Activo { get; set; }

    public virtual Asiento Asiento { get; set; } = null!;

    public virtual DetalleReserva? DetalleReserva { get; set; }

    public virtual Vuelo Vuelo { get; set; } = null!;
}
