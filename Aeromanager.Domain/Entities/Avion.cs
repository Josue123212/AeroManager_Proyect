using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Avion
{
    public int Id { get; set; }

    public string Matricula { get; set; } = null!;

    public int CapacidadFisica { get; set; }

    public string EstadoOperativo { get; set; } = null!;

    public int AerolineaId { get; set; }

    public int ModeloAvionId { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual Aerolinea Aerolinea { get; set; } = null!;

    public virtual ICollection<Asiento> Asiento { get; set; } = new List<Asiento>();

    public virtual ModeloAvion ModeloAvion { get; set; } = null!;

    public virtual ICollection<Vuelo> Vuelo { get; set; } = new List<Vuelo>();
}
