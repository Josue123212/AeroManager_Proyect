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
    private readonly IUnitOfWork _unitOfWork;

    public CreateReservaCommandHandler(IReservaRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ReservaDto> Handle(CreateReservaCommand command, CancellationToken cancellationToken = default)
    {
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
