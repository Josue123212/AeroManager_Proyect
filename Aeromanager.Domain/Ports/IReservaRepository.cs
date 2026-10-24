using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Ports;

public interface IReservaRepository : IGenericRepository<Reserva>
{
    Task<Reserva?> GetByCodigoTicketAsync(string codigoTicket, CancellationToken cancellationToken = default);
    Task<IEnumerable<Reserva>> GetReservasPorVueloAsync(int vueloId, CancellationToken cancellationToken = default);
}

