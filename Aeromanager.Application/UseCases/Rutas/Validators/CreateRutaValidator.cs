using FluentValidation;
using Aeromanager.Application.UseCases.Rutas.Commands;

namespace Aeromanager.Application.UseCases.Rutas.Validators;

public class CreateRutaValidator : AbstractValidator<CreateRutaCommand>
{
    public CreateRutaValidator()
    {
        RuleFor(x => x.CodigoRuta)
            .NotEmpty().WithMessage("El código de la ruta es requerido.")
            .MaximumLength(20).WithMessage("El código no debe superar 20 caracteres.");

        RuleFor(x => x.AeropuertoOrigenId)
            .GreaterThan(0).WithMessage("El aeropuerto de origen es requerido.");

        RuleFor(x => x.AeropuertoDestinoId)
            .GreaterThan(0).WithMessage("El aeropuerto de destino es requerido.")
            .NotEqual(x => x.AeropuertoOrigenId).WithMessage("El aeropuerto de destino no puede ser igual al de origen.");

        RuleFor(x => x.DistanciaKm)
            .GreaterThan(0).WithMessage("La distancia debe ser mayor a cero.");

        RuleFor(x => x.DuracionEstimadaMinutos)
            .GreaterThan(0).WithMessage("La duración estimada debe ser mayor a cero.");
    }
}
