using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.ClasesAsiento.Commands;

public record UpdateClaseAsientoCommand(
    int Id,
    string Nombre,
    decimal MultiplicadorTarifa,
    bool Activo
);

public class UpdateClaseAsientoCommandHandler
{
    private readonly IGenericRepository<ClaseAsiento> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateClaseAsientoCommandHandler(IGenericRepository<ClaseAsiento> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ClaseAsientoDto?> Handle(UpdateClaseAsientoCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.Nombre = command.Nombre;
        entity.MultiplicadorTarifa = command.MultiplicadorTarifa;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new ClaseAsientoDto(
            entity.Id,
            entity.Nombre,
            entity.MultiplicadorTarifa,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
