using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Aeropuertos.Commands;

public record CreateAeropuertoCommand(
    string Nombre,
    string CodigoIata,
    int CiudadId,
    string? Direccion
);

public class CreateAeropuertoCommandHandler
{
    private readonly IAeropuertoRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAeropuertoCommandHandler(IAeropuertoRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AeropuertoDto> Handle(CreateAeropuertoCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Aeropuerto
        {
            Nombre = command.Nombre,
            CodigoIata = command.CodigoIata.ToUpperInvariant(),
            CiudadId = command.CiudadId,
            Direccion = command.Direccion,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

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
