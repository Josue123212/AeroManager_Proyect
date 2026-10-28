using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Rutas.Queries;

public record GetRutasQuery();

public class GetRutasQueryHandler
{
    private readonly IRutaRepository _repository;

    public GetRutasQueryHandler(IRutaRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<RutaDto>> Handle(GetRutasQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new RutaDto(
            e.Id,
            e.CodigoRuta,
            e.AeropuertoOrigenId,
            e.AeropuertoDestinoId,
            e.DistanciaKm,
            e.DuracionEstimadaMinutos,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<RutaDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        return new RutaDto(
            entity.Id,
            entity.CodigoRuta,
            entity.AeropuertoOrigenId,
            entity.AeropuertoDestinoId,
            entity.DistanciaKm,
            entity.DuracionEstimadaMinutos,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
