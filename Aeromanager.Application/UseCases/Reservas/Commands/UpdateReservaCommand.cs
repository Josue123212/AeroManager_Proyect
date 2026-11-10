using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Reservas.Commands;

public record UpdateReservaCommand(
    int Id,
    string CodigoTicket,
    int VueloId,
    int UsuarioRegistroId,
    decimal MontoTotal,
    string EstadoReserva,
    bool Activo
);

public class UpdateReservaCommandHandler
{
    private readonly IReservaRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateReservaCommandHandler(IReservaRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<ReservaDto?> Handle(UpdateReservaCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        entity.CodigoTicket = command.CodigoTicket.ToUpperInvariant();
        entity.VueloId = command.VueloId;
        entity.UsuarioRegistroId = command.UsuarioRegistroId;
        entity.MontoTotal = command.MontoTotal;
        entity.EstadoReserva = command.EstadoReserva;
        entity.Activo = command.Activo;

        _repository.Update(entity);
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
