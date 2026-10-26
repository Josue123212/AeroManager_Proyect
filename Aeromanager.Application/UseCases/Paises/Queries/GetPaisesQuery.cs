using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Paises.Queries;

public record GetPaisesQuery();

public class GetPaisesQueryHandler
{
    private readonly IGenericRepository<Pais> _repository;

    public GetPaisesQueryHandler(IGenericRepository<Pais> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PaisDto>> Handle(GetPaisesQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new PaisDto(
            e.Id,
            e.Nombre,
            e.CodigoIso,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<PaisDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        return new PaisDto(
            entity.Id,
            entity.Nombre,
            entity.CodigoIso,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
