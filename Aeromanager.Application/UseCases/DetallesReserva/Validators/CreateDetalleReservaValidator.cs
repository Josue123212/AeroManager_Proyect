using FluentValidation;
using Aeromanager.Application.UseCases.DetallesReserva.Commands;

namespace Aeromanager.Application.UseCases.DetallesReserva.Validators;

public class CreateDetalleReservaValidator : AbstractValidator<CreateDetalleReservaCommand>
{
    public CreateDetalleReservaValidator()
    {
        RuleFor(x => x.ReservaId).GreaterThan(0).WithMessage("El ReservaId debe ser mayor a cero.");
        RuleFor(x => x.PasajeroId).GreaterThan(0).WithMessage("El PasajeroId debe ser mayor a cero.");
        RuleFor(x => x.AsientoVueloId).GreaterThan(0).WithMessage("El AsientoVueloId debe ser mayor a cero.");
        RuleFor(x => x.PrecioUnitario).GreaterThanOrEqualTo(0).WithMessage("El precio unitario no puede ser negativo.");
    }
}
