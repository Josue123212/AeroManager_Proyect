using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.AsientosVuelo.Commands;

public record UpdateAsientoVueloCommand(
    int Id,
    int VueloId,
    int AsientoId,
    bool EstaOcupado,
    string EstadoConcurrencia,
    bool Activo
);

public class UpdateAsientoVueloCommandHandler
{
    private readonly IAsientoVueloRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAsientoVueloCommandHandler(IAsientoVueloRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AsientoVueloDto?> Handle(UpdateAsientoVueloCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        entity.VueloId = command.VueloId;
        entity.AsientoId = command.AsientoId;
        entity.EstaOcupado = command.EstaOcupado;
        entity.EstadoConcurrencia = command.EstadoConcurrencia;
        entity.FechaActualizacion = DateTime.UtcNow;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return new AsientoVueloDto(
            entity.Id,
            entity.VueloId,
            entity.AsientoId,
            entity.EstaOcupado,
            entity.EstadoConcurrencia,
            entity.FechaActualizacion,
            entity.Activo
        );
    }
}
