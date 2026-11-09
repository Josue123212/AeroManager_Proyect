using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Reservas.Queries;

public record GetReservasQuery();

public class GetReservasQueryHandler
{
    private readonly IReservaRepository _repository;

    public GetReservasQueryHandler(IReservaRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ReservaDto>> Handle(GetReservasQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new ReservaDto(
            e.Id,
            e.CodigoTicket,
            e.VueloId,
            e.UsuarioRegistroId,
            e.FechaReserva,
            e.MontoTotal,
            e.EstadoReserva,
            e.Activo
        ));
    }

    public async Task<ReservaDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        return new ReservaDto(
            entity.Id,
            entity.CodigoTicket,
            entity.VueloId,
            entity.UsuarioRegistroId,
            entity.FechaReserva,
            entity.MontoTotal,
            entity.EstadoReserva,
            entity.Activo
        );
    }
}
