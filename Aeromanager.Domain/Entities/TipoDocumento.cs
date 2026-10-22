using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class TipoDocumento
{
    public int Id { get; set; }

    public string Codigo { get; set; } = null!;

    public string Nombre { get; set; } = null!;

    public int LongitudMaxima { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<Pasajero> Pasajero { get; set; } = new List<Pasajero>();
}
