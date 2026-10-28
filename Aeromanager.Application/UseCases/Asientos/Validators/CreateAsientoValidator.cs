using FluentValidation;
using Aeromanager.Application.UseCases.Asientos.Commands;

namespace Aeromanager.Application.UseCases.Asientos.Validators;

public class CreateAsientoValidator : AbstractValidator<CreateAsientoCommand>
{
    public CreateAsientoValidator()
    {
        RuleFor(x => x.Fila).GreaterThan(0).WithMessage("La fila debe ser mayor a cero.");

        RuleFor(x => x.Letra)
            .NotEmpty().WithMessage("La letra del asiento es requerida.")
            .MaximumLength(2).WithMessage("La letra no debe superar 2 caracteres.");

        RuleFor(x => x.AvionId).GreaterThan(0).WithMessage("El AvionId debe ser mayor a cero.");
        RuleFor(x => x.ClaseAsientoId).GreaterThan(0).WithMessage("El ClaseAsientoId debe ser mayor a cero.");
    }
}
