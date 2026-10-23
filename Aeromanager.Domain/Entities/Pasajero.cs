using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Pasajero
{
    public int Id { get; set; }

    public string Nombres { get; set; } = null!;

    public string Apellidos { get; set; } = null!;

    public int TipoDocumentoId { get; set; }

    public string NumeroDocumento { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Telefono { get; set; }

    public int NacionalidadPaisId { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<DetalleReserva> DetalleReserva { get; set; } = new List<DetalleReserva>();

    public virtual Pais NacionalidadPais { get; set; } = null!;

    public virtual TipoDocumento TipoDocumento { get; set; } = null!;
}
