using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.UsuarioRoles.Queries;

public record GetUsuarioRolesQuery();

public class GetUsuarioRolesQueryHandler
{
    private readonly IGenericRepository<UsuarioRol> _repository;

    public GetUsuarioRolesQueryHandler(IGenericRepository<UsuarioRol> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<UsuarioRolDto>> Handle(GetUsuarioRolesQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new UsuarioRolDto(
            e.Id,
            e.UsuarioId,
            e.RolId,
            e.FechaAsignacion,
            e.Activo
        ));
    }

    public async Task<UsuarioRolDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        return new UsuarioRolDto(
            entity.Id,
            entity.UsuarioId,
            entity.RolId,
            entity.FechaAsignacion,
            entity.Activo
        );
    }
}
