using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Ciudades.Commands;

public record UpdateCiudadCommand(
    int Id,
    string Nombre,
    int PaisId,
    bool Activo
);

public class UpdateCiudadCommandHandler
{
    private readonly IGenericRepository<Ciudad> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateCiudadCommandHandler(IGenericRepository<Ciudad> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CiudadDto?> Handle(UpdateCiudadCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        entity.Nombre = command.Nombre;
        entity.PaisId = command.PaisId;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return new CiudadDto(
            entity.Id,
            entity.Nombre,
            entity.PaisId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
