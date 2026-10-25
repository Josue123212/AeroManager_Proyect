using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Roles.Commands;

public record UpdateRolCommand(
    int Id,
    string Nombre,
    string? Descripcion,
    bool Activo
);

public class UpdateRolCommandHandler
{
    private readonly IGenericRepository<Rol> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRolCommandHandler(IGenericRepository<Rol> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<RolDto?> Handle(UpdateRolCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.Nombre = command.Nombre;
        entity.Descripcion = command.Descripcion;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RolDto(
            entity.Id,
            entity.Nombre,
            entity.Descripcion,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
