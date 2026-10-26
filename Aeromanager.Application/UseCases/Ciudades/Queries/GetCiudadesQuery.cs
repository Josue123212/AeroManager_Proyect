using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Ciudades.Queries;

public record GetCiudadesQuery();

public class GetCiudadesQueryHandler
{
    private readonly IGenericRepository<Ciudad> _repository;

    public GetCiudadesQueryHandler(IGenericRepository<Ciudad> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<CiudadDto>> Handle(GetCiudadesQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new CiudadDto(
            e.Id,
            e.Nombre,
            e.PaisId,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<CiudadDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        return new CiudadDto(
            entity.Id,
            entity.Nombre,
            entity.PaisId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
