using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Terminales.Commands;

public record CreateTerminalCommand(
    string Codigo,
    string Nombre,
    int AeropuertoId
);

public class CreateTerminalCommandHandler
{
    private readonly IGenericRepository<Terminal> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTerminalCommandHandler(IGenericRepository<Terminal> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TerminalDto> Handle(CreateTerminalCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Terminal
        {
            Codigo = command.Codigo,
            Nombre = command.Nombre,
            AeropuertoId = command.AeropuertoId,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TerminalDto(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.AeropuertoId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
