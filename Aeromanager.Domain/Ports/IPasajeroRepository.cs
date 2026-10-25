using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Ports;

public interface IPasajeroRepository : IGenericRepository<Pasajero>
{
    Task<Pasajero?> GetByDocumentoAsync(int tipoDocumentoId, string numeroDocumento, CancellationToken cancellationToken = default);
}

