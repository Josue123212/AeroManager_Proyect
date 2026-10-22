using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Aeropuerto
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string CodigoIata { get; set; } = null!;

    public int CiudadId { get; set; }

    public string? Direccion { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual Ciudad Ciudad { get; set; } = null!;

    public virtual ICollection<Ruta> RutaAeropuertoDestino { get; set; } = new List<Ruta>();

    public virtual ICollection<Ruta> RutaAeropuertoOrigen { get; set; } = new List<Ruta>();

    public virtual ICollection<Terminal> Terminal { get; set; } = new List<Terminal>();
}
