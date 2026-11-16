using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Infrastructure.Repositories;

public class AeropuertoRepository : GenericRepository<Aeropuerto>, IAeropuertoRepository
{
    public AeropuertoRepository(AeroManagerDbContext context) : base(context)
    {
    }

    public async Task<Aeropuerto?> GetByCodigoIataAsync(string codigoIata, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(a => a.CodigoIata == codigoIata, cancellationToken);
    }

    public async Task<bool> ExistsByCodigoIataAsync(string codigoIata, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(a => a.CodigoIata == codigoIata, cancellationToken);
    }
}
