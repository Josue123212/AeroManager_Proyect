namespace Aeromanager.Application.DTOs;

public record ReservaDto(
    int Id,
    string CodigoTicket,
    int VueloId,
    int UsuarioRegistroId,
    DateTime FechaReserva,
    decimal MontoTotal,
    string EstadoReserva,
    bool Activo
);
