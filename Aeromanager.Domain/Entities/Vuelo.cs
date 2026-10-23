using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Vuelo
{
    public int Id { get; set; }

    public string NumeroVuelo { get; set; } = null!;

    public int RutaId { get; set; }

    public int AvionId { get; set; }

    public int PuertaEmbarqueId { get; set; }

    public DateTime FechaHoraSalida { get; set; }

    public DateTime FechaHoraLlegada { get; set; }

    public int CapacidadVuelo { get; set; }

    public decimal PrecioBase { get; set; }

    public string Estado { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<AsientoVuelo> AsientoVuelo { get; set; } = new List<AsientoVuelo>();

    public virtual Avion Avion { get; set; } = null!;

    public virtual PuertaEmbarque PuertaEmbarque { get; set; } = null!;

    public virtual ICollection<Reserva> Reserva { get; set; } = new List<Reserva>();

    public virtual Ruta Ruta { get; set; } = null!;
}
