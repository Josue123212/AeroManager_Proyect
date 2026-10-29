using FluentValidation;
using Aeromanager.Application.UseCases.AsientosVuelo.Commands;

namespace Aeromanager.Application.UseCases.AsientosVuelo.Validators;

public class CreateAsientoVueloValidator : AbstractValidator<CreateAsientoVueloCommand>
{
    public CreateAsientoVueloValidator()
    {
        RuleFor(x => x.VueloId).GreaterThan(0).WithMessage("El VueloId debe ser mayor a cero.");
        RuleFor(x => x.AsientoId).GreaterThan(0).WithMessage("El AsientoId debe ser mayor a cero.");
    }
}
