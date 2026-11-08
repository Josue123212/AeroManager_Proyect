using FluentValidation;
using Aeromanager.Application.UseCases.PuertasEmbarque.Commands;

namespace Aeromanager.Application.UseCases.PuertasEmbarque.Validators;

public class CreatePuertaEmbarqueValidator : AbstractValidator<CreatePuertaEmbarqueCommand>
{
    public CreatePuertaEmbarqueValidator()
    {
        RuleFor(x => x.CodigoGate)
            .NotEmpty().WithMessage("El cÃ³digo del gate es requerido.")
            .MaximumLength(10).WithMessage("El cÃ³digo no debe superar 10 caracteres.");

        RuleFor(x => x.Estado)
            .NotEmpty().WithMessage("El estado del gate es requerido.")
            .MaximumLength(20).WithMessage("El estado no debe superar 20 caracteres.");

        RuleFor(x => x.TerminalId).GreaterThan(0).WithMessage("El TerminalId debe ser mayor a cero.");
    }
}
