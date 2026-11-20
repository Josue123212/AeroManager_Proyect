using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using FluentValidation;
using FluentValidation.Results;

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
    private readonly IGenericRepository<Rol> _rolRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUsuarioRolCommandHandler(
        IGenericRepository<UsuarioRol> repository,
        IGenericRepository<Rol> rolRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _rolRepository = rolRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UsuarioRolDto?> Handle(
        UpdateUsuarioRolCommand command,
        bool callerIsSuperAdmin = false,
        CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        var currentRol = await _rolRepository.GetByIdAsync(entity.RolId);
        var targetRol = await _rolRepository.GetByIdAsync(command.RolId);

        if (currentRol is not null && currentRol.Nombre.Trim().Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException(new[]
            {
                new ValidationFailure(nameof(command.RolId), "La asignación de SuperAdmin es inmutable desde la aplicación.")
            });
        }

        if (targetRol is not null && targetRol.Nombre.Trim().Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException(new[]
            {
                new ValidationFailure(nameof(command.RolId), "El rol SuperAdmin no puede asignarse desde la aplicación.")
            });
        }

        var touchesAdmin =
            (currentRol is not null && currentRol.Nombre.Trim().Contains("Administrador", StringComparison.OrdinalIgnoreCase)) ||
            (targetRol is not null && targetRol.Nombre.Trim().Contains("Administrador", StringComparison.OrdinalIgnoreCase));

        if (touchesAdmin && !callerIsSuperAdmin)
        {
            throw new ValidationException(new[]
            {
                new ValidationFailure(nameof(command.RolId), "Solo un SuperAdmin puede modificar o revocar el rol Administrador.")
            });
        }

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
