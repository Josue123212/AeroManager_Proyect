using FluentValidation;
using Aeromanager.Application.UseCases.ModelosAvion.Commands;

namespace Aeromanager.Application.UseCases.ModelosAvion.Validators;

public class CreateModeloAvionValidator : AbstractValidator<CreateModeloAvionCommand>
{
    public CreateModeloAvionValidator()
    {
        RuleFor(x => x.Fabricante)
            .NotEmpty().WithMessage("El fabricante es requerido.")
            .MaximumLength(100).WithMessage("El fabricante no debe superar 100 caracteres.");

        RuleFor(x => x.NombreModelo)
            .NotEmpty().WithMessage("El nombre del modelo es requerido.")
            .MaximumLength(100).WithMessage("El nombre del modelo no debe superar 100 caracteres.");

        RuleFor(x => x.CapacidadTeorica)
            .GreaterThan(0).WithMessage("La capacidad teÃ³rica debe ser mayor a cero.");

        RuleFor(x => x.AutonomiaKm)
            .GreaterThan(0).WithMessage("La autonomÃ­a en Km debe ser mayor a cero.");
    }
}
