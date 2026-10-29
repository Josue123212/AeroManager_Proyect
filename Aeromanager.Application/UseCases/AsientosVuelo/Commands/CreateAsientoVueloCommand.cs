using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.AsientosVuelo.Commands;

public record CreateAsientoVueloCommand(
    int VueloId,
    int AsientoId,
    bool EstaOcupado = false,
    string EstadoConcurrencia = "LIBRE"
);

public class CreateAsientoVueloCommandHandler
{
    private readonly IAsientoVueloRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAsientoVueloCommandHandler(IAsientoVueloRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AsientoVueloDto> Handle(CreateAsientoVueloCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new AsientoVuelo
        {
            VueloId = command.VueloId,
            AsientoId = command.AsientoId,
            EstaOcupado = command.EstaOcupado,
            EstadoConcurrencia = command.EstadoConcurrencia,
            FechaActualizacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
