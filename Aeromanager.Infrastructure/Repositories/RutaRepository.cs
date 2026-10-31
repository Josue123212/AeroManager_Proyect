using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Infrastructure.Repositories;

public class RutaRepository : GenericRepository<Ruta>, IRutaRepository
{
    public RutaRepository(AeroManagerDbContext context) : base(context)
    {
    }

    public async Task<Ruta?> GetByCodigoRutaAsync(string codigoRuta, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(r => r.CodigoRuta == codigoRuta, cancellationToken);
    }

    public async Task<IEnumerable<Ruta>> GetByAeropuertosAsync(int origenId, int destinoId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Where(r => r.AeropuertoOrigenId == origenId && r.AeropuertoDestinoId == destinoId)
            .ToListAsync(cancellationToken);
    }
}
