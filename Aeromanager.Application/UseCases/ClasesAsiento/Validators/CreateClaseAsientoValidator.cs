using FluentValidation;
using Aeromanager.Application.UseCases.ClasesAsiento.Commands;

namespace Aeromanager.Application.UseCases.ClasesAsiento.Validators;

public class CreateClaseAsientoValidator : AbstractValidator<CreateClaseAsientoCommand>
{
    public CreateClaseAsientoValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre de la clase es requerido.")
            .MaximumLength(50).WithMessage("El nombre no debe superar 50 caracteres.");

        RuleFor(x => x.MultiplicadorTarifa)
            .GreaterThan(0).WithMessage("El multiplicador de tarifa debe ser mayor a cero.");
    }
}
