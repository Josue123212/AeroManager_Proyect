using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using FluentValidation;
using FluentValidation.Results;

namespace Aeromanager.Application.UseCases.UsuarioRoles.Commands;

public record CreateUsuarioRolCommand(
    int UsuarioId,
    int RolId
);

public class CreateUsuarioRolCommandHandler
{
    private readonly IGenericRepository<UsuarioRol> _repository;
    private readonly IGenericRepository<Rol> _rolRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUsuarioRolCommandHandler(
        IGenericRepository<UsuarioRol> repository,
        IGenericRepository<Rol> rolRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _rolRepository = rolRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UsuarioRolDto> Handle(
        CreateUsuarioRolCommand command,
        bool callerIsSuperAdmin = false,
        CancellationToken cancellationToken = default)
    {
        var rol = await _rolRepository.GetByIdAsync(command.RolId);
        if (rol is null)
        {
            throw new KeyNotFoundException($"No se encontró el rol con ID {command.RolId}.");
        }

        if (rol.Nombre.Trim().Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException(new[]
            {
                new ValidationFailure(nameof(command.RolId), "El rol SuperAdmin es exclusivo de sistema y no puede asignarse desde la aplicación.")
            });
        }

        if (rol.Nombre.Trim().Contains("Administrador", StringComparison.OrdinalIgnoreCase) && !callerIsSuperAdmin)
        {
            throw new ValidationException(new[]
            {
                new ValidationFailure(nameof(command.RolId), "Solo un SuperAdmin puede asignar el rol Administrador.")
            });
        }

        var entity = new UsuarioRol
        {
            UsuarioId = command.UsuarioId,
            RolId = command.RolId,
            FechaAsignacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity);
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
