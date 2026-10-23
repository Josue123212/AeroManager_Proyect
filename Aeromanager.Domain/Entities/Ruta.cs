using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Ruta
{
    public int Id { get; set; }

    public string CodigoRuta { get; set; } = null!;

    public int AeropuertoOrigenId { get; set; }

    public int AeropuertoDestinoId { get; set; }

    public int DistanciaKm { get; set; }

    public int DuracionEstimadaMinutos { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual Aeropuerto AeropuertoDestino { get; set; } = null!;

    public virtual Aeropuerto AeropuertoOrigen { get; set; } = null!;

    public virtual ICollection<Vuelo> Vuelo { get; set; } = new List<Vuelo>();
}
