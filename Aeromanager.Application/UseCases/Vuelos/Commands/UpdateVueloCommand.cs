using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Vuelos.Commands;

public record UpdateVueloCommand(
    int Id,
    string NumeroVuelo,
    int RutaId,
    int AvionId,
    int PuertaEmbarqueId,
    DateTime FechaHoraSalida,
    DateTime FechaHoraLlegada,
    int CapacidadVuelo,
    decimal PrecioBase,
    string Estado,
    bool Activo
);

public class UpdateVueloCommandHandler
{
    private readonly IVueloRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateVueloCommandHandler(IVueloRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<VueloDto?> Handle(UpdateVueloCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.NumeroVuelo = command.NumeroVuelo.ToUpperInvariant();
        entity.RutaId = command.RutaId;
        entity.AvionId = command.AvionId;
        entity.PuertaEmbarqueId = command.PuertaEmbarqueId;
        entity.FechaHoraSalida = command.FechaHoraSalida;
        entity.FechaHoraLlegada = command.FechaHoraLlegada;
        entity.CapacidadVuelo = command.CapacidadVuelo;
        entity.PrecioBase = command.PrecioBase;
        entity.Estado = command.Estado;
        entity.Activo = command.Activo;

        _repository.Update(entity);
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
