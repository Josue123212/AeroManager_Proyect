using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Paises.Commands;

public record UpdatePaisCommand(
    int Id,
    string Nombre,
    string CodigoIso,
    bool Activo
);

public class UpdatePaisCommandHandler
{
    private readonly IGenericRepository<Pais> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePaisCommandHandler(IGenericRepository<Pais> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PaisDto?> Handle(UpdatePaisCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        entity.Nombre = command.Nombre;
        entity.CodigoIso = command.CodigoIso;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return new PaisDto(
            entity.Id,
            entity.Nombre,
            entity.CodigoIso,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
