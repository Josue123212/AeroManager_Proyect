using FluentValidation;
using Aeromanager.Application.UseCases.Aerolineas.Commands;

namespace Aeromanager.Application.UseCases.Aerolineas.Validators;

public class CreateAerolineaValidator : AbstractValidator<CreateAerolineaCommand>
{
    public CreateAerolineaValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre de la aerolínea es requerido.")
            .MaximumLength(100).WithMessage("El nombre no debe superar 100 caracteres.");

        RuleFor(x => x.CodigoIata)
            .NotEmpty().WithMessage("El código IATA es requerido.")
            .Length(2, 3).WithMessage("El código IATA debe tener 2 o 3 caracteres.");

        RuleFor(x => x.PaisOrigenId).GreaterThan(0).WithMessage("El PaisOrigenId debe ser mayor a cero.");
    }
}
