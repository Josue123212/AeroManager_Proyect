using FluentValidation;
using Aeromanager.Application.UseCases.Terminales.Commands;

namespace Aeromanager.Application.UseCases.Terminales.Validators;

public class CreateTerminalValidator : AbstractValidator<CreateTerminalCommand>
{
    public CreateTerminalValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("El cÃ³digo de la terminal es requerido.")
            .MaximumLength(10).WithMessage("El cÃ³digo no debe superar 10 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre de la terminal es requerido.")
            .MaximumLength(50).WithMessage("El nombre no debe superar 50 caracteres.");

        RuleFor(x => x.AeropuertoId).GreaterThan(0).WithMessage("El AeropuertoId debe ser mayor a cero.");
    }
}
