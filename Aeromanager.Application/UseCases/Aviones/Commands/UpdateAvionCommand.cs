using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Aviones.Commands;

public record UpdateAvionCommand(
    int Id,
    string Matricula,
    int CapacidadFisica,
    string EstadoOperativo,
    int AerolineaId,
    int ModeloAvionId,
    bool Activo
);

public class UpdateAvionCommandHandler
{
    private readonly IAvionRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAvionCommandHandler(IAvionRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AvionDto?> Handle(UpdateAvionCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.Matricula = command.Matricula.ToUpperInvariant();
        entity.CapacidadFisica = command.CapacidadFisica;
        entity.EstadoOperativo = command.EstadoOperativo;
        entity.AerolineaId = command.AerolineaId;
        entity.ModeloAvionId = command.ModeloAvionId;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AvionDto(
            entity.Id,
            entity.Matricula,
            entity.CapacidadFisica,
            entity.EstadoOperativo,
            entity.AerolineaId,
            entity.ModeloAvionId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
