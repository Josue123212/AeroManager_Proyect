using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.ClasesAsiento.Queries;

public record GetClasesAsientoQuery();

public class GetClasesAsientoQueryHandler
{
    private readonly IGenericRepository<ClaseAsiento> _repository;

    public GetClasesAsientoQueryHandler(IGenericRepository<ClaseAsiento> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ClaseAsientoDto>> Handle(GetClasesAsientoQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new ClaseAsientoDto(
            e.Id,
            e.Nombre,
            e.MultiplicadorTarifa,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<ClaseAsientoDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        return new ClaseAsientoDto(
            entity.Id,
            entity.Nombre,
            entity.MultiplicadorTarifa,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
