using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Infrastructure.Repositories;

public class VueloRepository : GenericRepository<Vuelo>, IVueloRepository
{
    public VueloRepository(AeroManagerDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Vuelo>> GetVuelosProgramadosPorFechaAsync(DateTime fecha, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(v => v.FechaHoraSalida.Date == fecha.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<Vuelo?> GetVueloConDisponibilidadAsync(int vueloId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(v => v.AsientoVuelo)
            .FirstOrDefaultAsync(v => v.Id == vueloId, cancellationToken);
    }
}
