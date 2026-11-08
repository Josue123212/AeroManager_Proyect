using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.TiposDocumento.Queries;

public record GetTiposDocumentoQuery();

public class GetTiposDocumentoQueryHandler
{
    private readonly IGenericRepository<TipoDocumento> _repository;

    public GetTiposDocumentoQueryHandler(IGenericRepository<TipoDocumento> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<TipoDocumentoDto>> Handle(GetTiposDocumentoQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new TipoDocumentoDto(
            e.Id,
            e.Codigo,
            e.Nombre,
            e.LongitudMaxima,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<TipoDocumentoDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        return new TipoDocumentoDto(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.LongitudMaxima,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
