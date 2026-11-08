using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Aeropuertos.Queries;

public record GetAeropuertosQuery();

public class GetAeropuertosQueryHandler
{
    private readonly IAeropuertoRepository _repository;

    public GetAeropuertosQueryHandler(IAeropuertoRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AeropuertoDto>> Handle(GetAeropuertosQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new AeropuertoDto(
            e.Id,
            e.Nombre,
            e.CodigoIata,
            e.CiudadId,
            e.Direccion,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<AeropuertoDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        return new AeropuertoDto(
            entity.Id,
            entity.Nombre,
            entity.CodigoIata,
            entity.CiudadId,
            entity.Direccion,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
