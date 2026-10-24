using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Ports;

public interface IAvionRepository : IGenericRepository<Avion>
{
    Task<Avion?> GetByMatriculaAsync(string matricula, CancellationToken cancellationToken = default);
    Task<bool> ExistsByMatriculaAsync(string matricula, CancellationToken cancellationToken = default);
}

