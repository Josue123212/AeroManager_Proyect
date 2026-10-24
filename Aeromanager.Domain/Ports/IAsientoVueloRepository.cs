using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Ports;

public interface IAsientoVueloRepository : IGenericRepository<AsientoVuelo>
{
    Task<IEnumerable<AsientoVuelo>> GetAsientosDisponiblesPorVueloAsync(int vueloId, CancellationToken cancellationToken = default);
    Task<bool> EstaAsientoDisponibleAsync(int asientoVueloId, CancellationToken cancellationToken = default);
}

