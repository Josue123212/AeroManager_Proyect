using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.DetallesReserva.Commands;

public record UpdateDetalleReservaCommand(
    int Id,
    int ReservaId,
    int PasajeroId,
    int AsientoVueloId,
    decimal PrecioUnitario,
    bool Activo
);

public class UpdateDetalleReservaCommandHandler
{
    private readonly IGenericRepository<DetalleReserva> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateDetalleReservaCommandHandler(IGenericRepository<DetalleReserva> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DetalleReservaDto?> Handle(UpdateDetalleReservaCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.ReservaId = command.ReservaId;
        entity.PasajeroId = command.PasajeroId;
        entity.AsientoVueloId = command.AsientoVueloId;
        entity.PrecioUnitario = command.PrecioUnitario;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new DetalleReservaDto(
            entity.Id,
            entity.ReservaId,
            entity.PasajeroId,
            entity.AsientoVueloId,
            entity.PrecioUnitario,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
