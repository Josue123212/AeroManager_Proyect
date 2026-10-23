using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Terminal
{
    public int Id { get; set; }

    public string Codigo { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public int AeropuertoId { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual Aeropuerto Aeropuerto { get; set; } = null!;

    public virtual ICollection<PuertaEmbarque> PuertaEmbarque { get; set; } = new List<PuertaEmbarque>();
}
