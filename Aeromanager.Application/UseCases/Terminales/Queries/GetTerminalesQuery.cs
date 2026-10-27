using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Terminales.Queries;

public record GetTerminalesQuery();

public class GetTerminalesQueryHandler
{
    private readonly IGenericRepository<Terminal> _repository;

    public GetTerminalesQueryHandler(IGenericRepository<Terminal> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<TerminalDto>> Handle(GetTerminalesQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new TerminalDto(
            e.Id,
            e.Codigo,
            e.Nombre,
            e.AeropuertoId,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<TerminalDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        return new TerminalDto(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.AeropuertoId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
