using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Asientos.Commands;

public record UpdateAsientoCommand(
    int Id,
    int Fila,
    string Letra,
    int AvionId,
    int ClaseAsientoId,
    bool Activo
);

public class UpdateAsientoCommandHandler
{
    private readonly IGenericRepository<Asiento> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAsientoCommandHandler(IGenericRepository<Asiento> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AsientoDto?> Handle(UpdateAsientoCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.Fila = command.Fila;
        entity.Letra = command.Letra.ToUpperInvariant();
        entity.AvionId = command.AvionId;
        entity.ClaseAsientoId = command.ClaseAsientoId;
        entity.Activo = command.Activo;

        _repository.Update(entity);
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
