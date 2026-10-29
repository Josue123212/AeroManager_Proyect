using FluentValidation;
using Aeromanager.Application.UseCases.Vuelos.Commands;

namespace Aeromanager.Application.UseCases.Vuelos.Validators;

public class CreateVueloValidator : AbstractValidator<CreateVueloCommand>
{
    public CreateVueloValidator()
    {
        RuleFor(x => x.NumeroVuelo)
            .NotEmpty().WithMessage("El número de vuelo es requerido.")
            .MaximumLength(20).WithMessage("El número de vuelo no debe superar 20 caracteres.");

        RuleFor(x => x.RutaId).GreaterThan(0).WithMessage("La ruta es requerida.");
        RuleFor(x => x.AvionId).GreaterThan(0).WithMessage("El avión es requerido.");
        RuleFor(x => x.PuertaEmbarqueId).GreaterThan(0).WithMessage("La puerta de embarque es requerida.");

        RuleFor(x => x.FechaHoraSalida)
            .NotEmpty().WithMessage("La fecha y hora de salida es requerida.");

        RuleFor(x => x.FechaHoraLlegada)
            .NotEmpty().WithMessage("La fecha y hora de llegada es requerida.")
            .GreaterThan(x => x.FechaHoraSalida).WithMessage("La fecha y hora de llegada debe ser estrictamente posterior a la de salida.");

        RuleFor(x => x.CapacidadVuelo)
            .GreaterThan(0).WithMessage("La capacidad del vuelo debe ser mayor a cero.");

        RuleFor(x => x.PrecioBase)
            .GreaterThan(0).WithMessage("El precio base debe ser mayor a cero.");
    }
}
