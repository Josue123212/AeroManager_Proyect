using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.ModelosAvion.Commands;

public record UpdateModeloAvionCommand(
    int Id,
    string Fabricante,
    string NombreModelo,
    int CapacidadTeorica,
    int AutonomiaKm,
    bool Activo
);

public class UpdateModeloAvionCommandHandler
{
    private readonly IGenericRepository<ModeloAvion> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateModeloAvionCommandHandler(IGenericRepository<ModeloAvion> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ModeloAvionDto?> Handle(UpdateModeloAvionCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.Fabricante = command.Fabricante;
        entity.NombreModelo = command.NombreModelo;
        entity.CapacidadTeorica = command.CapacidadTeorica;
        entity.AutonomiaKm = command.AutonomiaKm;
        entity.Activo = command.Activo;

        _repository.Update(entity);
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
