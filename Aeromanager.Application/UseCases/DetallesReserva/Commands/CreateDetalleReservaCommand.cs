using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Domain.Services;

namespace Aeromanager.Application.UseCases.DetallesReserva.Commands;

public record CreateDetalleReservaCommand(
    int ReservaId,
    int PasajeroId,
    int AsientoVueloId,
    decimal PrecioUnitario
);

public class CreateDetalleReservaCommandHandler(
    IGenericRepository<DetalleReserva> repository,
    IAsientoVueloRepository asientoVueloRepository,
    ReservaDomainService reservaDomainService,
    IUnitOfWork unitOfWork)
{
    public async Task<DetalleReservaDto> Handle(CreateDetalleReservaCommand command, CancellationToken cancellationToken = default)
    {
        var asientoVuelo = await asientoVueloRepository.GetByIdAsync(command.AsientoVueloId);
        if (asientoVuelo is null)
        {
            throw new KeyNotFoundException("El asiento de vuelo especificado no existe.");
        }

        // Delega la validación de la regla de dominio al Servicio de Dominio (como pidió el Prof. Mayhua)
        reservaDomainService.ValidarAsignacionDeAsiento(asientoVuelo, command.PrecioUnitario);

        await unitOfWork.BeginTransactionAsync();

        asientoVuelo.EstaOcupado = true;
        asientoVuelo.EstadoConcurrencia = "Reservado";
        asientoVuelo.FechaActualizacion = DateTime.UtcNow;
        asientoVueloRepository.Update(asientoVuelo);

        var entity = new DetalleReserva
        {
            ReservaId = command.ReservaId,
            PasajeroId = command.PasajeroId,
            AsientoVueloId = command.AsientoVueloId,
            PrecioUnitario = command.PrecioUnitario,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await repository.AddAsync(entity);
        await unitOfWork.CommitTransactionAsync();

        return new DetalleReservaDto(
            entity.Id,
            entity.ReservaId,
            entity.PasajeroId,
            entity.AsientoVueloId,
            entity.PrecioUnitario,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
