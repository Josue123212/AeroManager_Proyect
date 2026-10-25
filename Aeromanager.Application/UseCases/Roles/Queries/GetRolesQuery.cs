using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Roles.Queries;

public record GetRolesQuery();

public class GetRolesQueryHandler
{
    private readonly IGenericRepository<Rol> _repository;

    public GetRolesQueryHandler(IGenericRepository<Rol> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RolDto>> Handle(GetRolesQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new RolDto(
            e.Id,
            e.Nombre,
            e.Descripcion,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<RolDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        return new RolDto(
            entity.Id,
            entity.Nombre,
            entity.Descripcion,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
