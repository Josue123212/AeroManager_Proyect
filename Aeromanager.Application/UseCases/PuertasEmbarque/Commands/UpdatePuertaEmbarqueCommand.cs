using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.PuertasEmbarque.Commands;

public record UpdatePuertaEmbarqueCommand(
    int Id,
    string CodigoGate,
    string Estado,
    int TerminalId,
    bool Activo
);

public class UpdatePuertaEmbarqueCommandHandler
{
    private readonly IGenericRepository<PuertaEmbarque> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePuertaEmbarqueCommandHandler(IGenericRepository<PuertaEmbarque> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PuertaEmbarqueDto?> Handle(UpdatePuertaEmbarqueCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.CodigoGate = command.CodigoGate;
        entity.Estado = command.Estado;
        entity.TerminalId = command.TerminalId;
        entity.Activo = command.Activo;

        _repository.Update(entity);
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
