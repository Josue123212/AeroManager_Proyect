using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Ports;

public interface IAeropuertoRepository : IGenericRepository<Aeropuerto>
{
    Task<Aeropuerto?> GetByCodigoIataAsync(string codigoIata, CancellationToken cancellationToken = default);
    Task<bool> ExistsByCodigoIataAsync(string codigoIata, CancellationToken cancellationToken = default);
}

