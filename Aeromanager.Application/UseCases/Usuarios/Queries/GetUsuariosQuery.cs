using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Usuarios.Queries;

public record GetUsuariosQuery();

public class GetUsuariosQueryHandler
{
    private readonly IGenericRepository<Usuario> _repository;

    public GetUsuariosQueryHandler(IGenericRepository<Usuario> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<UsuarioDto>> Handle(GetUsuariosQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new UsuarioDto(
            e.Id,
            e.NombreCompleto,
            e.Email,
            e.EstadoAcceso,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<UsuarioDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        return new UsuarioDto(
            entity.Id,
            entity.NombreCompleto,
            entity.Email,
            entity.EstadoAcceso,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
