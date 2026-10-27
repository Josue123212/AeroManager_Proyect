using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Aviones.Commands;

public record CreateAvionCommand(
    string Matricula,
    int CapacidadFisica,
    string EstadoOperativo,
    int AerolineaId,
    int ModeloAvionId
);

public class CreateAvionCommandHandler
{
    private readonly IAvionRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAvionCommandHandler(IAvionRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AvionDto> Handle(CreateAvionCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Avion
        {
            Matricula = command.Matricula.ToUpperInvariant(),
            CapacidadFisica = command.CapacidadFisica,
            EstadoOperativo = command.EstadoOperativo,
            AerolineaId = command.AerolineaId,
            ModeloAvionId = command.ModeloAvionId,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
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
