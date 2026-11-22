using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Domain.Services;

namespace Aeromanager.Application.UseCases.Vuelos.Commands;

public record CreateVueloCommand(
    string NumeroVuelo,
    int RutaId,
    int AvionId,
    int PuertaEmbarqueId,
    DateTime FechaHoraSalida,
    DateTime FechaHoraLlegada,
    int CapacidadVuelo,
    decimal PrecioBase,
    string Estado = "PROGRAMADO"
);

public class CreateVueloCommandHandler
{
    private readonly IVueloRepository _repository;
    private readonly IGenericRepository<Asiento> _asientoRepository;
    private readonly IAsientoVueloRepository _asientoVueloRepository;
    private readonly VueloDomainService _vueloDomainService;
    private readonly IUnitOfWork _unitOfWork;

    public CreateVueloCommandHandler(
        IVueloRepository repository,
        IGenericRepository<Asiento> asientoRepository,
        IAsientoVueloRepository asientoVueloRepository,
        VueloDomainService vueloDomainService,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _asientoRepository = asientoRepository;
        _asientoVueloRepository = asientoVueloRepository;
        _vueloDomainService = vueloDomainService;
        _unitOfWork = unitOfWork;
    }

    public async Task<VueloDto> Handle(CreateVueloCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Vuelo
        {
            NumeroVuelo = command.NumeroVuelo.ToUpperInvariant(),
            RutaId = command.RutaId,
            AvionId = command.AvionId,
            PuertaEmbarqueId = command.PuertaEmbarqueId,
            FechaHoraSalida = command.FechaHoraSalida,
            FechaHoraLlegada = command.FechaHoraLlegada,
            CapacidadVuelo = command.CapacidadVuelo,
            PrecioBase = command.PrecioBase,
            Estado = command.Estado,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        _vueloDomainService.ValidarReglasDeVuelo(entity);

        await _repository.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        var asientosAvion = await _asientoRepository.FindAsync(
            a => a.AvionId == entity.AvionId && a.Activo,
            cancellationToken);

        var hasSeats = false;
        foreach (var asiento in asientosAvion)
        {
            await _asientoVueloRepository.AddAsync(new AsientoVuelo
            {
                VueloId = entity.Id,
                AsientoId = asiento.Id,
                EstaOcupado = false,
                EstadoConcurrencia = "LIBRE",
                FechaActualizacion = DateTime.UtcNow,
                Activo = true
            });
            hasSeats = true;
        }

        if (hasSeats)
        {
            await _unitOfWork.SaveChangesAsync();
        }

        return new VueloDto(
            entity.Id,
            entity.NumeroVuelo,
            entity.RutaId,
            entity.AvionId,
            entity.PuertaEmbarqueId,
            entity.FechaHoraSalida,
            entity.FechaHoraLlegada,
            entity.CapacidadVuelo,
            entity.PrecioBase,
            entity.Estado,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
