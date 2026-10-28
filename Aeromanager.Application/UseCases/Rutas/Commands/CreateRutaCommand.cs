using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Rutas.Commands;

public record CreateRutaCommand(
    string CodigoRuta,
    int AeropuertoOrigenId,
    int AeropuertoDestinoId,
    int DistanciaKm,
    int DuracionEstimadaMinutos
);

public class CreateRutaCommandHandler
{
    private readonly IRutaRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateRutaCommandHandler(IRutaRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<RutaDto> Handle(CreateRutaCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Ruta
        {
            CodigoRuta = command.CodigoRuta.ToUpperInvariant(),
            AeropuertoOrigenId = command.AeropuertoOrigenId,
            AeropuertoDestinoId = command.AeropuertoDestinoId,
            DistanciaKm = command.DistanciaKm,
            DuracionEstimadaMinutos = command.DuracionEstimadaMinutos,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new RutaDto(
            entity.Id,
            entity.CodigoRuta,
            entity.AeropuertoOrigenId,
            entity.AeropuertoDestinoId,
            entity.DistanciaKm,
            entity.DuracionEstimadaMinutos,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
