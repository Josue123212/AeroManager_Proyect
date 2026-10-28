using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Vuelos.Commands;

public record CreateVueloCommand(
    string NumeroVuelo,
    int RutaId,
    int AvionId,
    int PuertaEmbarqueId,
    DateTime FechaHoraSalida,
    DateTime FechaHoraLlegada,
    int CapacidadVuelo,
    decimal PrecioBase,
    string Estado = "PROGRAMADO"
);

public class CreateVueloCommandHandler
{
    private readonly IVueloRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateVueloCommandHandler(IVueloRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<VueloDto> Handle(CreateVueloCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Vuelo
        {
            NumeroVuelo = command.NumeroVuelo.ToUpperInvariant(),
            RutaId = command.RutaId,
            AvionId = command.AvionId,
            PuertaEmbarqueId = command.PuertaEmbarqueId,
            FechaHoraSalida = command.FechaHoraSalida,
            FechaHoraLlegada = command.FechaHoraLlegada,
            CapacidadVuelo = command.CapacidadVuelo,
            PrecioBase = command.PrecioBase,
            Estado = command.Estado,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new VueloDto(
            entity.Id,
            entity.NumeroVuelo,
            entity.RutaId,
            entity.AvionId,
            entity.PuertaEmbarqueId,
            entity.FechaHoraSalida,
            entity.FechaHoraLlegada,
            entity.CapacidadVuelo,
            entity.PrecioBase,
            entity.Estado,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
