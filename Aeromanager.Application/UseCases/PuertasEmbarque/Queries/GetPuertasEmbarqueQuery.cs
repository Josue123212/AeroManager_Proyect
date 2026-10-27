using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.PuertasEmbarque.Queries;

public record GetPuertasEmbarqueQuery();

public class GetPuertasEmbarqueQueryHandler
{
    private readonly IGenericRepository<PuertaEmbarque> _repository;

    public GetPuertasEmbarqueQueryHandler(IGenericRepository<PuertaEmbarque> repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<PuertaEmbarqueDto>> Handle(GetPuertasEmbarqueQuery query, CancellationToken cancellationToken = default)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new PuertaEmbarqueDto(
            e.Id,
            e.CodigoGate,
            e.Estado,
            e.TerminalId,
            e.FechaCreacion,
            e.Activo
        ));
    }

    public async Task<PuertaEmbarqueDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity == null) return null;

        return new PuertaEmbarqueDto(
            entity.Id,
            entity.CodigoGate,
            entity.Estado,
            entity.TerminalId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
