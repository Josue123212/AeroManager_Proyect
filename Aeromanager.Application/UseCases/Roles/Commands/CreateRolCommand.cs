using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Roles.Commands;

public record CreateRolCommand(
    string Nombre,
    string? Descripcion
);

public class CreateRolCommandHandler
{
    private readonly IGenericRepository<Rol> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRolCommandHandler(IGenericRepository<Rol> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<RolDto> Handle(CreateRolCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Rol
        {
            Nombre = command.Nombre,
            Descripcion = command.Descripcion,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        return new RolDto(
            entity.Id,
            entity.Nombre,
            entity.Descripcion,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
