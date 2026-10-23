using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class PuertaEmbarque
{
    public int Id { get; set; }

    public string CodigoGate { get; set; } = null!;

    public string Estado { get; set; } = null!;

    public int TerminalId { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual Terminal Terminal { get; set; } = null!;

    public virtual ICollection<Vuelo> Vuelo { get; set; } = new List<Vuelo>();
}
