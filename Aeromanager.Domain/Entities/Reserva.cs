using System;
using System.Collections.Generic;

namespace Aeromanager.Domain.Entities;

public partial class Reserva
{
    public int Id { get; set; }

    public string CodigoTicket { get; set; } = null!;

    public int VueloId { get; set; }

    public int UsuarioRegistroId { get; set; }

    public DateTime FechaReserva { get; set; }

    public decimal MontoTotal { get; set; }

    public string EstadoReserva { get; set; } = null!;

    public bool Activo { get; set; }

    public virtual ICollection<DetalleReserva> DetalleReserva { get; set; } = new List<DetalleReserva>();

    public virtual Usuario UsuarioRegistro { get; set; } = null!;

    public virtual Vuelo Vuelo { get; set; } = null!;
}
