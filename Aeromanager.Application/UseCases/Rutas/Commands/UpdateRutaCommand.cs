using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Domain.Services;

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
    private readonly RutaDomainService _rutaDomainService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateRutaCommandHandler(IRutaRepository repository, RutaDomainService rutaDomainService, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _rutaDomainService = rutaDomainService;
        _unitOfWork = unitOfWork;
    }

    public async Task<RutaDto?> Handle(UpdateRutaCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        entity.CodigoRuta = command.CodigoRuta.ToUpperInvariant();
        entity.AeropuertoOrigenId = command.AeropuertoOrigenId;
        entity.AeropuertoDestinoId = command.AeropuertoDestinoId;
        entity.DistanciaKm = command.DistanciaKm;
        entity.DuracionEstimadaMinutos = command.DuracionEstimadaMinutos;
        entity.Activo = command.Activo;

        _rutaDomainService.ValidarReglasDeRuta(entity);

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

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
