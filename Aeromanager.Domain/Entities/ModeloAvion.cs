using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class ModeloAvion
{
    public int Id { get; set; }

    public string Fabricante { get; set; } = null!;

    public string NombreModelo { get; set; } = null!;

    public int CapacidadTeorica { get; set; }

    public int AutonomiaKm { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<Avion> Avion { get; set; } = new List<Avion>();
}
