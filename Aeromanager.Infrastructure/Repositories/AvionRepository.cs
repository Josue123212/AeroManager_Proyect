using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Infrastructure.Repositories;

public class AvionRepository : GenericRepository<Avion>, IAvionRepository
{
    public AvionRepository(AeroManagerDbContext context) : base(context)
    {
    }

    public async Task<Avion?> GetByMatriculaAsync(string matricula, CancellationToken cancellationToken = default)
    {
        return await _dbSet.FirstOrDefaultAsync(a => a.Matricula == matricula, cancellationToken);
    }

    public async Task<bool> ExistsByMatriculaAsync(string matricula, CancellationToken cancellationToken = default)
    {
        return await _dbSet.AnyAsync(a => a.Matricula == matricula, cancellationToken);
    }
}
