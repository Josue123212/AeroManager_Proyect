using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Aerolineas.Queries;

public record GetAerolineasQuery();

public class GetAerolineasQueryHandler
{
    private readonly IGenericRepository<Aerolinea> _repository;

    public GetAerolineasQueryHandler(IGenericRepository<Aerolinea> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AerolineaDto>> Handle(GetAerolineasQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new AerolineaDto(
            e.Id,
            e.Nombre,
            e.CodigoIata,
            e.PaisOrigenId,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<AerolineaDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        return new AerolineaDto(
            entity.Id,
            entity.Nombre,
            entity.CodigoIata,
            entity.PaisOrigenId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
