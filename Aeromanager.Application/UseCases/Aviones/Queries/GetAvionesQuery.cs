using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Aviones.Queries;

public record GetAvionesQuery();

public class GetAvionesQueryHandler
{
    private readonly IAvionRepository _repository;

    public GetAvionesQueryHandler(IAvionRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<AvionDto>> Handle(GetAvionesQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new AvionDto(
            e.Id,
            e.Matricula,
            e.CapacidadFisica,
            e.EstadoOperativo,
            e.AerolineaId,
            e.ModeloAvionId,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<AvionDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        return new AvionDto(
            entity.Id,
            entity.Matricula,
            entity.CapacidadFisica,
            entity.EstadoOperativo,
            entity.AerolineaId,
            entity.ModeloAvionId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
