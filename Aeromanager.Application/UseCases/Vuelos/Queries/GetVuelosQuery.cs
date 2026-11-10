using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Vuelos.Queries;

public record GetVuelosQuery();

public class GetVuelosQueryHandler
{
    private readonly IVueloRepository _repository;

    public GetVuelosQueryHandler(IVueloRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<VueloDto>> Handle(GetVuelosQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new VueloDto(
            e.Id,
            e.NumeroVuelo,
            e.RutaId,
            e.AvionId,
            e.PuertaEmbarqueId,
            e.FechaHoraSalida,
            e.FechaHoraLlegada,
            e.CapacidadVuelo,
            e.PrecioBase,
            e.Estado,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<VueloDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        return new VueloDto(
            entity.Id,
            entity.NumeroVuelo,
            entity.RutaId,
            entity.AvionId,
            entity.PuertaEmbarqueId,
            entity.FechaHoraSalida,
            entity.FechaHoraLlegada,
            entity.CapacidadVuelo,
            entity.PrecioBase,
            entity.Estado,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
