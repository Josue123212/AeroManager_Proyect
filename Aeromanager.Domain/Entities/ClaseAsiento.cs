using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class ClaseAsiento
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public decimal MultiplicadorTarifa { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<Asiento> Asiento { get; set; } = new List<Asiento>();
}
