using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Asientos.Queries;

public record GetAsientosQuery();

public class GetAsientosQueryHandler
{
    private readonly IGenericRepository<Asiento> _repository;

    public GetAsientosQueryHandler(IGenericRepository<Asiento> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AsientoDto>> Handle(GetAsientosQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new AsientoDto(
            e.Id,
            e.Fila,
            e.Letra,
            e.AvionId,
            e.ClaseAsientoId,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<AsientoDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        return new AsientoDto(
            entity.Id,
            entity.Fila,
            entity.Letra,
            entity.AvionId,
            entity.ClaseAsientoId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
