using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Aeropuertos.Commands;

public record UpdateAeropuertoCommand(
    int Id,
    string Nombre,
    string CodigoIata,
    int CiudadId,
    string? Direccion,
    bool Activo
);

public class UpdateAeropuertoCommandHandler
{
    private readonly IAeropuertoRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAeropuertoCommandHandler(IAeropuertoRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AeropuertoDto?> Handle(UpdateAeropuertoCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.Nombre = command.Nombre;
        entity.CodigoIata = command.CodigoIata.ToUpperInvariant();
        entity.CiudadId = command.CiudadId;
        entity.Direccion = command.Direccion;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new AeropuertoDto(
            entity.Id,
            entity.Nombre,
            entity.CodigoIata,
            entity.CiudadId,
            entity.Direccion,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
