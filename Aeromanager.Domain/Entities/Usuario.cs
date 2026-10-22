using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Usuario
{
    public int Id { get; set; }

    public string NombreCompleto { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string EstadoAcceso { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }

    public bool Activo { get; set; }

    public virtual ICollection<Reserva> Reserva { get; set; } = new List<Reserva>();

    public virtual ICollection<UsuarioRol> UsuarioRol { get; set; } = new List<UsuarioRol>();
}
