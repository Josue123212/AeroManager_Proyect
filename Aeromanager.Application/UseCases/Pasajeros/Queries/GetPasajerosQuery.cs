using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Pasajeros.Queries;

public record GetPasajerosQuery();

public class GetPasajerosQueryHandler
{
    private readonly IPasajeroRepository _repository;

    public GetPasajerosQueryHandler(IPasajeroRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PasajeroDto>> Handle(GetPasajerosQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new PasajeroDto(
            e.Id,
            e.Nombres,
            e.Apellidos,
            e.TipoDocumentoId,
            e.NumeroDocumento,
            e.Email,
            e.Telefono,
            e.NacionalidadPaisId,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<PasajeroDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        return new PasajeroDto(
            entity.Id,
            entity.Nombres,
            entity.Apellidos,
            entity.TipoDocumentoId,
            entity.NumeroDocumento,
            entity.Email,
            entity.Telefono,
            entity.NacionalidadPaisId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
