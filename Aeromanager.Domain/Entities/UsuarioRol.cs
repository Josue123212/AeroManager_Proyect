using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class UsuarioRol
{
    public int Id { get; set; }

    public int UsuarioId { get; set; }

    public int RolId { get; set; }

    public DateTime FechaAsignacion { get; set; }

    public bool Activo { get; set; }

    public virtual Rol Rol { get; set; } = null!;

    public virtual Usuario Usuario { get; set; } = null!;
}
