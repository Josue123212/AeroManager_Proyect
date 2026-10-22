using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Ciudad
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public int PaisId { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<Aeropuerto> Aeropuerto { get; set; } = new List<Aeropuerto>();

    public virtual Pais Pais { get; set; } = null!;
}
