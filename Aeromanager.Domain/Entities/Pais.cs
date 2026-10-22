using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Pais
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string CodigoIso { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<Aerolinea> Aerolinea { get; set; } = new List<Aerolinea>();

    public virtual ICollection<Ciudad> Ciudad { get; set; } = new List<Ciudad>();

    public virtual ICollection<Pasajero> Pasajero { get; set; } = new List<Pasajero>();
}
