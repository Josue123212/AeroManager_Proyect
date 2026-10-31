using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Infrastructure.Repositories;

public class PasajeroRepository : GenericRepository<Pasajero>, IPasajeroRepository
{
    public PasajeroRepository(AeroManagerDbContext context) : base(context)
    {
    }

    public async Task<Pasajero?> GetByDocumentoAsync(int tipoDocumentoId, string numeroDocumento, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(
            p => p.TipoDocumentoId == tipoDocumentoId && p.NumeroDocumento == numeroDocumento,
            cancellationToken);
    }
}
