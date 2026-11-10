using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.UsuarioRoles.Commands;

public record CreateUsuarioRolCommand(
    int UsuarioId,
    int RolId
);

public class CreateUsuarioRolCommandHandler
{
    private readonly IGenericRepository<UsuarioRol> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUsuarioRolCommandHandler(IGenericRepository<UsuarioRol> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UsuarioRolDto> Handle(CreateUsuarioRolCommand command, CancellationToken cancellationToken = default)
    {
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
