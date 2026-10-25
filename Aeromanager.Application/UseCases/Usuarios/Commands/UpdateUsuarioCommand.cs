using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Usuarios.Commands;

public record UpdateUsuarioCommand(
    int Id,
    string NombreCompleto,
    string Email,
    string EstadoAcceso,
    bool Activo
);

public class UpdateUsuarioCommandHandler
{
    private readonly IGenericRepository<Usuario> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUsuarioCommandHandler(IGenericRepository<Usuario> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UsuarioDto?> Handle(UpdateUsuarioCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.NombreCompleto = command.NombreCompleto;
        entity.Email = command.Email;
        entity.EstadoAcceso = command.EstadoAcceso;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
