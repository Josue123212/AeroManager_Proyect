using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;

namespace Aeromanager.Infrastructure;

public class UnitOfWork : IUnitOfWork
{
    private readonly AeroManagerDbContext _context;

    public UnitOfWork(AeroManagerDbContext context)
    {
        _context = context;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
