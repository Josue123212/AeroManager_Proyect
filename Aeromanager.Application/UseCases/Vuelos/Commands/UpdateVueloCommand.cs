using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Domain.Services;

namespace Aeromanager.Application.UseCases.Vuelos.Commands;

public record UpdateVueloCommand(
    int Id,
    string NumeroVuelo,
    int RutaId,
    int AvionId,
    int PuertaEmbarqueId,
    DateTime FechaHoraSalida,
    DateTime FechaHoraLlegada,
    int CapacidadVuelo,
    decimal PrecioBase,
    string Estado,
    bool Activo
);

public class UpdateVueloCommandHandler
{
    private readonly IVueloRepository _repository;
    private readonly IGenericRepository<PuertaEmbarque> _puertaRepository;
    private readonly VueloDomainService _vueloDomainService;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateVueloCommandHandler(
        IVueloRepository repository,
        IGenericRepository<PuertaEmbarque> puertaRepository,
        VueloDomainService vueloDomainService,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _puertaRepository = puertaRepository;
        _vueloDomainService = vueloDomainService;
        _unitOfWork = unitOfWork;
    }

    public async Task<VueloDto?> Handle(UpdateVueloCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        var gate = await _puertaRepository.GetByIdAsync(command.PuertaEmbarqueId);
        if (gate is null || !gate.Activo)
        {
            throw new InvalidOperationException("Regla Operativa: La puerta de embarque seleccionada no existe o está inactiva.");
        }

        if (command.Activo &&
            !command.Estado.Contains("CANCEL", StringComparison.OrdinalIgnoreCase) &&
            !command.Estado.Contains("ATERRIZ", StringComparison.OrdinalIgnoreCase) &&
            gate.Estado.Contains("MANTEN", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Regla Operativa (Gate en Mantenimiento): La puerta {gate.CodigoGate} está cerrada por mantenimiento.");
        }

        var existingOnGate = await _repository.FindAsync(
            v => v.Id != command.Id && v.Activo && v.PuertaEmbarqueId == command.PuertaEmbarqueId,
            cancellationToken);

        if (command.Activo &&
            !command.Estado.Contains("CANCEL", StringComparison.OrdinalIgnoreCase) &&
            !command.Estado.Contains("ATERRIZ", StringComparison.OrdinalIgnoreCase))
        {
            var conflict = existingOnGate.FirstOrDefault(v =>
                !v.Estado.Contains("CANCEL", StringComparison.OrdinalIgnoreCase) &&
                !v.Estado.Contains("ATERRIZ", StringComparison.OrdinalIgnoreCase) &&
                Math.Abs((v.FechaHoraSalida - command.FechaHoraSalida).TotalMinutes) < 45);

            if (conflict is not null)
            {
                throw new InvalidOperationException($"Conflicto de Gate (Buffer 45 min): La puerta {gate.CodigoGate} ya está asignada al vuelo {conflict.NumeroVuelo} en un horario cercano.");
            }
        }

        entity.NumeroVuelo = command.NumeroVuelo.ToUpperInvariant();
        entity.RutaId = command.RutaId;
        entity.AvionId = command.AvionId;
        entity.PuertaEmbarqueId = command.PuertaEmbarqueId;
        entity.FechaHoraSalida = command.FechaHoraSalida;
        entity.FechaHoraLlegada = command.FechaHoraLlegada;
        entity.CapacidadVuelo = command.CapacidadVuelo;
        entity.PrecioBase = command.PrecioBase;
        entity.Estado = command.Estado;
        entity.Activo = command.Activo;

        _vueloDomainService.ValidarReglasDeVuelo(entity);

        if (!gate.Estado.Contains("MANTEN", StringComparison.OrdinalIgnoreCase))
        {
            if (entity.Activo && entity.Estado.Contains("ABORD", StringComparison.OrdinalIgnoreCase))
            {
                gate.Estado = "En Abordaje";
                _puertaRepository.Update(gate);
            }
            else if (gate.Estado.Contains("ABORD", StringComparison.OrdinalIgnoreCase) &&
                     !existingOnGate.Any(v => v.Estado.Contains("ABORD", StringComparison.OrdinalIgnoreCase)))
            {
                gate.Estado = "Disponible";
                _puertaRepository.Update(gate);
            }
        }

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

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
