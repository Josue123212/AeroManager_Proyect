using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Infrastructure.Repositories;

public class AsientoVueloRepository : GenericRepository<AsientoVuelo>, IAsientoVueloRepository
{
    public AsientoVueloRepository(AeroManagerDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<AsientoVuelo>> GetAsientosDisponiblesPorVueloAsync(int vueloId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(av => av.VueloId == vueloId && !av.EstaOcupado && av.Activo)
            .Include(av => av.Asiento)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> EstaAsientoDisponibleAsync(int asientoVueloId, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(av => av.Id == asientoVueloId && !av.EstaOcupado && av.Activo, cancellationToken);
    }
}
