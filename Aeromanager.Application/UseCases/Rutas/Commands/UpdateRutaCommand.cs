using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Rutas.Commands;

public record UpdateRutaCommand(
    int Id,
    string CodigoRuta,
    int AeropuertoOrigenId,
    int AeropuertoDestinoId,
    int DistanciaKm,
    int DuracionEstimadaMinutos,
    bool Activo
);

public class UpdateRutaCommandHandler
{
    private readonly IRutaRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRutaCommandHandler(IRutaRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<RutaDto?> Handle(UpdateRutaCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id, cancellationToken);
        if (entity == null) return null;

        entity.CodigoRuta = command.CodigoRuta.ToUpperInvariant();
        entity.AeropuertoOrigenId = command.AeropuertoOrigenId;
        entity.AeropuertoDestinoId = command.AeropuertoDestinoId;
        entity.DistanciaKm = command.DistanciaKm;
        entity.DuracionEstimadaMinutos = command.DuracionEstimadaMinutos;
        entity.Activo = command.Activo;

        _repository.Update(entity);
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
