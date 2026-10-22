using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Aerolinea
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string CodigoIata { get; set; } = null!;

    public int PaisOrigenId { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<Avion> Avion { get; set; } = new List<Avion>();

    public virtual Pais PaisOrigen { get; set; } = null!;
}
