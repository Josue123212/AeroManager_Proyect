using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Terminales.Commands;

public record UpdateTerminalCommand(
    int Id,
    string Codigo,
    string Nombre,
    int AeropuertoId,
    bool Activo
);

public class UpdateTerminalCommandHandler
{
    private readonly IGenericRepository<Terminal> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTerminalCommandHandler(IGenericRepository<Terminal> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TerminalDto?> Handle(UpdateTerminalCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        entity.Codigo = command.Codigo;
        entity.Nombre = command.Nombre;
        entity.AeropuertoId = command.AeropuertoId;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

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
