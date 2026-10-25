using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Usuarios.Commands;

public record CreateUsuarioCommand(
    string NombreCompleto,
    string Email,
    string PasswordHash,
    string EstadoAcceso = "ACTIVO"
);

public class CreateUsuarioCommandHandler
{
    private readonly IGenericRepository<Usuario> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUsuarioCommandHandler(IGenericRepository<Usuario> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<UsuarioDto> Handle(CreateUsuarioCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Usuario
        {
            NombreCompleto = command.NombreCompleto,
            Email = command.Email,
            PasswordHash = command.PasswordHash,
            EstadoAcceso = command.EstadoAcceso,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
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
