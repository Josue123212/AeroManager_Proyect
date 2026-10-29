using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.DetallesReserva.Commands;

public record CreateDetalleReservaCommand(
    int ReservaId,
    int PasajeroId,
    int AsientoVueloId,
    decimal PrecioUnitario
);

public class CreateDetalleReservaCommandHandler
{
    private readonly IGenericRepository<DetalleReserva> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateDetalleReservaCommandHandler(IGenericRepository<DetalleReserva> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<DetalleReservaDto> Handle(CreateDetalleReservaCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new DetalleReserva
        {
            ReservaId = command.ReservaId,
            PasajeroId = command.PasajeroId,
            AsientoVueloId = command.AsientoVueloId,
            PrecioUnitario = command.PrecioUnitario,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
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
