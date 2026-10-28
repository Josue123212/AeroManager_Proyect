using FluentValidation;
using Aeromanager.Application.UseCases.Aviones.Commands;

namespace Aeromanager.Application.UseCases.Aviones.Validators;

public class CreateAvionValidator : AbstractValidator<CreateAvionCommand>
{
    public CreateAvionValidator()
    {
        RuleFor(x => x.Matricula)
            .NotEmpty().WithMessage("La matrícula es requerida.")
            .MaximumLength(20).WithMessage("La matrícula no debe superar 20 caracteres.");

        RuleFor(x => x.CapacidadFisica)
            .GreaterThan(0).WithMessage("La capacidad física debe ser mayor a cero.");

        RuleFor(x => x.EstadoOperativo)
            .NotEmpty().WithMessage("El estado operativo es requerido.");

        RuleFor(x => x.AerolineaId).GreaterThan(0).WithMessage("El AerolineaId debe ser mayor a cero.");
        RuleFor(x => x.ModeloAvionId).GreaterThan(0).WithMessage("El ModeloAvionId debe ser mayor a cero.");
    }
}
