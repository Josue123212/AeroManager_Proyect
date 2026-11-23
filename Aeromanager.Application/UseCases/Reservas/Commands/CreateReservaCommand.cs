using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Reservas.Commands;

public record CreateReservaCommand(
    string CodigoTicket,
    int VueloId,
    int UsuarioRegistroId,
    decimal MontoTotal,
    string EstadoReserva = "CONFIRMADA"
);

public class CreateReservaCommandHandler
{
    private readonly IReservaRepository _repository;
    private readonly IVueloRepository _vueloRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateReservaCommandHandler(
        IReservaRepository repository,
        IVueloRepository vueloRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _vueloRepository = vueloRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ReservaDto> Handle(CreateReservaCommand command, CancellationToken cancellationToken = default)
    {
        var vuelo = await _vueloRepository.GetByIdAsync(command.VueloId);
        if (vuelo is null || !vuelo.Activo)
        {
            throw new InvalidOperationException("Regla Operativa: El vuelo seleccionado no existe o está inactivo.");
        }

        var estadoUp = (vuelo.Estado ?? string.Empty).Trim().ToUpperInvariant();
        if (estadoUp.Contains("ABORD"))
        {
            throw new InvalidOperationException("Cierre de Ventas Counter (DCS): El vuelo ya se encuentra En Abordaje y el mostrador cerró ventas para esta salida.");
        }

        if (estadoUp.Contains("VUELO") || estadoUp.Contains("ATERRIZ") || estadoUp.Contains("CANCEL"))
        {
            throw new InvalidOperationException($"Cierre Operativo de Ventas: No se pueden emitir reservas para un vuelo en estado {vuelo.Estado}.");
        }

        var entity = new Reserva
        {
            CodigoTicket = command.CodigoTicket.ToUpperInvariant(),
            VueloId = command.VueloId,
            UsuarioRegistroId = command.UsuarioRegistroId,
            FechaReserva = DateTime.UtcNow,
            MontoTotal = command.MontoTotal,
            EstadoReserva = command.EstadoReserva,
            Activo = true
        };

        await _repository.AddAsync(entity);
        await _unitOfWork.SaveChangesAsync();

        return new ReservaDto(
            entity.Id,
            entity.CodigoTicket,
            entity.VueloId,
            entity.UsuarioRegistroId,
            entity.FechaReserva,
            entity.MontoTotal,
            entity.EstadoReserva,
            entity.Activo
        );
    }
}
