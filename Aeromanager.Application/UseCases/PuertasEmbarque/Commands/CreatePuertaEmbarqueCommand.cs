using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.PuertasEmbarque.Commands;

public record CreatePuertaEmbarqueCommand(
    string CodigoGate,
    string Estado,
    int TerminalId
);

public class CreatePuertaEmbarqueCommandHandler
{
    private readonly IGenericRepository<PuertaEmbarque> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePuertaEmbarqueCommandHandler(IGenericRepository<PuertaEmbarque> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PuertaEmbarqueDto> Handle(CreatePuertaEmbarqueCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new PuertaEmbarque
        {
            CodigoGate = command.CodigoGate,
            Estado = command.Estado,
            TerminalId = command.TerminalId,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
