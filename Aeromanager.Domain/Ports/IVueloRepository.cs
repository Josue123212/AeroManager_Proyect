using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Ports;

public interface IVueloRepository : IGenericRepository<Vuelo>
{
    Task<IEnumerable<Vuelo>> GetVuelosProgramadosPorFechaAsync(DateTime fecha, CancellationToken cancellationToken = default);
    Task<Vuelo?> GetVueloConDisponibilidadAsync(int vueloId, CancellationToken cancellationToken = default);
}

