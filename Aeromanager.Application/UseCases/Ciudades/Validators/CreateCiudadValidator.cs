using FluentValidation;
using Aeromanager.Application.UseCases.Ciudades.Commands;

namespace Aeromanager.Application.UseCases.Ciudades.Validators;

public class CreateCiudadValidator : AbstractValidator<CreateCiudadCommand>
{
    public CreateCiudadValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre de la ciudad es requerido.")
            .MaximumLength(100).WithMessage("El nombre no debe superar 100 caracteres.");

        RuleFor(x => x.PaisId).GreaterThan(0).WithMessage("El PaisId debe ser mayor a cero.");
    }
}
