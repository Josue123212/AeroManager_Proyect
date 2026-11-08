using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Ciudades.Commands;

public record CreateCiudadCommand(
    string Nombre,
    int PaisId
);

public class CreateCiudadCommandHandler
{
    private readonly IGenericRepository<Ciudad> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCiudadCommandHandler(IGenericRepository<Ciudad> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CiudadDto> Handle(CreateCiudadCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Ciudad
        {
            Nombre = command.Nombre,
            PaisId = command.PaisId,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity);
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
