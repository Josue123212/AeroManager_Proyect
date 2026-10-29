using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.AsientosVuelo.Queries;

public record GetAsientosVueloQuery();

public class GetAsientosVueloQueryHandler
{
    private readonly IAsientoVueloRepository _repository;

    public GetAsientosVueloQueryHandler(IAsientoVueloRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AsientoVueloDto>> Handle(GetAsientosVueloQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new AsientoVueloDto(
            e.Id,
            e.VueloId,
            e.AsientoId,
            e.EstaOcupado,
            e.EstadoConcurrencia,
            e.FechaActualizacion,
            e.Activo
        ));
    }

    public async Task<AsientoVueloDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        return new AsientoVueloDto(
            entity.Id,
            entity.VueloId,
            entity.AsientoId,
            entity.EstaOcupado,
            entity.EstadoConcurrencia,
            entity.FechaActualizacion,
            entity.Activo
        );
    }
}
