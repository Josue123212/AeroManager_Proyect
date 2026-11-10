using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.UsuarioRoles.Commands;

public record UpdateUsuarioRolCommand(
    int Id,
    int UsuarioId,
    int RolId,
    bool Activo
);

public class UpdateUsuarioRolCommandHandler
{
    private readonly IGenericRepository<UsuarioRol> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUsuarioRolCommandHandler(IGenericRepository<UsuarioRol> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UsuarioRolDto?> Handle(UpdateUsuarioRolCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        entity.UsuarioId = command.UsuarioId;
        entity.RolId = command.RolId;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return new UsuarioRolDto(
            entity.Id,
            entity.UsuarioId,
            entity.RolId,
            entity.FechaAsignacion,
            entity.Activo
        );
    }
}
