using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.ModelosAvion.Commands;

public record CreateModeloAvionCommand(
    string Fabricante,
    string NombreModelo,
    int CapacidadTeorica,
    int AutonomiaKm
);

public class CreateModeloAvionCommandHandler
{
    private readonly IGenericRepository<ModeloAvion> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateModeloAvionCommandHandler(IGenericRepository<ModeloAvion> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ModeloAvionDto> Handle(CreateModeloAvionCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new ModeloAvion
        {
            Fabricante = command.Fabricante,
            NombreModelo = command.NombreModelo,
            CapacidadTeorica = command.CapacidadTeorica,
            AutonomiaKm = command.AutonomiaKm,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ModeloAvionDto(
            entity.Id,
            entity.Fabricante,
            entity.NombreModelo,
            entity.CapacidadTeorica,
            entity.AutonomiaKm,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
