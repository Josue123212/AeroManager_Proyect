using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Rol
{
    public int Id { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<UsuarioRol> UsuarioRol { get; set; } = new List<UsuarioRol>();
}
