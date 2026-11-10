using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.DetallesReserva.Queries;

public record GetDetallesReservaQuery();

public class GetDetallesReservaQueryHandler
{
    private readonly IGenericRepository<DetalleReserva> _repository;

    public GetDetallesReservaQueryHandler(IGenericRepository<DetalleReserva> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<DetalleReservaDto>> Handle(GetDetallesReservaQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new DetalleReservaDto(
            e.Id,
            e.ReservaId,
            e.PasajeroId,
            e.AsientoVueloId,
            e.PrecioUnitario,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<DetalleReservaDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

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
