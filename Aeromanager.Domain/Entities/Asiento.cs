using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Asiento
{
    public int Id { get; set; }

    public int Fila { get; set; }

    public string Letra { get; set; } = null!;

    public int AvionId { get; set; }

    public int ClaseAsientoId { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<AsientoVuelo> AsientoVuelo { get; set; } = new List<AsientoVuelo>();

    public virtual Avion Avion { get; set; } = null!;

    public virtual ClaseAsiento ClaseAsiento { get; set; } = null!;
}
