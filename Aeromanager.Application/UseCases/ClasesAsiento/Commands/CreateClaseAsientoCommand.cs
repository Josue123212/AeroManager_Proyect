using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.ClasesAsiento.Commands;

public record CreateClaseAsientoCommand(
    string Nombre,
    decimal MultiplicadorTarifa
);

public class CreateClaseAsientoCommandHandler
{
    private readonly IGenericRepository<ClaseAsiento> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateClaseAsientoCommandHandler(IGenericRepository<ClaseAsiento> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ClaseAsientoDto> Handle(CreateClaseAsientoCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new ClaseAsiento
        {
            Nombre = command.Nombre,
            MultiplicadorTarifa = command.MultiplicadorTarifa,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        return new ClaseAsientoDto(
            entity.Id,
            entity.Nombre,
            entity.MultiplicadorTarifa,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
