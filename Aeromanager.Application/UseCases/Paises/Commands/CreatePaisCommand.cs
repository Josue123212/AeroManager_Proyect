using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Paises.Commands;

public record CreatePaisCommand(
    string Nombre,
    string CodigoIso
);

public class CreatePaisCommandHandler
{
    private readonly IGenericRepository<Pais> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePaisCommandHandler(IGenericRepository<Pais> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PaisDto> Handle(CreatePaisCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Pais
        {
            Nombre = command.Nombre,
            CodigoIso = command.CodigoIso,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new PaisDto(
            entity.Id,
            entity.Nombre,
            entity.CodigoIso,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
