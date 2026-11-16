using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Infrastructure.Repositories;

public class ReservaRepository : GenericRepository<Reserva>, IReservaRepository
{
    public ReservaRepository(AeroManagerDbContext context) : base(context)
    {
    }

    public async Task<Reserva?> GetByCodigoTicketAsync(string codigoTicket, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(r => r.DetalleReserva)
            .FirstOrDefaultAsync(r => r.CodigoTicket == codigoTicket, cancellationToken);
    }

    public async Task<IEnumerable<Reserva>> GetReservasPorVueloAsync(int vueloId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.VueloId == vueloId)
            .Include(r => r.DetalleReserva)
            .ToListAsync(cancellationToken);
    }
}
