using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Ports;

public interface IRutaRepository : IGenericRepository<Ruta>
{
    Task<Ruta?> GetByCodigoRutaAsync(string codigoRuta, CancellationToken cancellationToken = default);
    Task<IEnumerable<Ruta>> GetByAeropuertosAsync(int origenId, int destinoId, CancellationToken cancellationToken = default);
}

