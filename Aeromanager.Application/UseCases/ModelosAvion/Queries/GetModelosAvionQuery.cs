using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.ModelosAvion.Queries;

public record GetModelosAvionQuery();

public class GetModelosAvionQueryHandler
{
    private readonly IGenericRepository<ModeloAvion> _repository;

    public GetModelosAvionQueryHandler(IGenericRepository<ModeloAvion> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<ModeloAvionDto>> Handle(GetModelosAvionQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(e => new ModeloAvionDto(
            e.Id,
            e.Fabricante,
            e.NombreModelo,
            e.CapacidadTeorica,
            e.AutonomiaKm,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<ModeloAvionDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return null;

        return new ModeloAvionDto(
            entity.Id,
            entity.Fabricante,
            entity.NombreModelo,
            entity.CapacidadTeorica,
            entity.AutonomiaKm,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
