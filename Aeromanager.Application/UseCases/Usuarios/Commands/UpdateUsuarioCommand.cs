using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using FluentValidation;
using FluentValidation.Results;

namespace Aeromanager.Application.UseCases.Usuarios.Commands;

public record UpdateUsuarioCommand(
    int Id,
    string NombreCompleto,
    string Email,
    string EstadoAcceso,
    bool Activo,
    string? PasswordHash = null
);

public class UpdateUsuarioCommandHandler
{
    private readonly IGenericRepository<Usuario> _repository;
    private readonly IGenericRepository<UsuarioRol> _usuarioRolRepository;
    private readonly IGenericRepository<Rol> _rolRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUsuarioCommandHandler(
        IGenericRepository<Usuario> repository,
        IGenericRepository<UsuarioRol> usuarioRolRepository,
        IGenericRepository<Rol> rolRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _usuarioRolRepository = usuarioRolRepository;
        _rolRepository = rolRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UsuarioDto?> Handle(
        UpdateUsuarioCommand command,
        bool callerIsSuperAdmin = false,
        CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        var roles = (await _rolRepository.GetAllAsync(cancellationToken)).ToList();
        var userRoles = (await _usuarioRolRepository.FindAsync(
            ur => ur.UsuarioId == command.Id && ur.Activo,
            cancellationToken)).ToList();

        var assignedRoleNames = userRoles
            .Select(ur => roles.FirstOrDefault(r => r.Id == ur.RolId)?.Nombre ?? string.Empty)
            .ToList();

        var targetIsSuperAdmin = assignedRoleNames.Any(n =>
            n.Trim().Equals("SuperAdmin", StringComparison.OrdinalIgnoreCase));

        if (targetIsSuperAdmin && (!command.Activo || !string.Equals(command.EstadoAcceso.Trim(), "Activo", StringComparison.OrdinalIgnoreCase)))
        {
            throw new ValidationException(new[]
            {
                new ValidationFailure(nameof(command.EstadoAcceso), "No está permitido suspender o desactivar la cuenta SuperAdmin.")
            });
        }

        var targetIsAdminOrHigher = assignedRoleNames.Any(n =>
            n.Contains("Admin", StringComparison.OrdinalIgnoreCase));

        if (!callerIsSuperAdmin && targetIsAdminOrHigher)
        {
            throw new ValidationException(new[]
            {
                new ValidationFailure(nameof(command.Id), "Un Administrador solo puede modificar o suspender cuentas operativas (Operador o Counter).")
            });
        }

        entity.NombreCompleto = command.NombreCompleto;
        entity.Email = command.Email;
        entity.EstadoAcceso = command.EstadoAcceso;
        entity.Activo = command.Activo;
        if (!string.IsNullOrWhiteSpace(command.PasswordHash))
        {
            entity.PasswordHash = command.PasswordHash;
        }

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

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
