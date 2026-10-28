using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Asientos.Commands;

public record CreateAsientoCommand(
    int Fila,
    string Letra,
    int AvionId,
    int ClaseAsientoId
);

public class CreateAsientoCommandHandler
{
    private readonly IGenericRepository<Asiento> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAsientoCommandHandler(IGenericRepository<Asiento> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AsientoDto> Handle(CreateAsientoCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Asiento
        {
            Fila = command.Fila,
            Letra = command.Letra.ToUpperInvariant(),
            AvionId = command.AvionId,
            ClaseAsientoId = command.ClaseAsientoId,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AsientoDto(
            entity.Id,
            entity.Fila,
            entity.Letra,
            entity.AvionId,
            entity.ClaseAsientoId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
