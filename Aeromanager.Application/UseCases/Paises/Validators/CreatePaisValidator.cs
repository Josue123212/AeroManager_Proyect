using FluentValidation;
using Aeromanager.Application.UseCases.Paises.Commands;

namespace Aeromanager.Application.UseCases.Paises.Validators;

public class CreatePaisValidator : AbstractValidator<CreatePaisCommand>
{
    public CreatePaisValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre del paÃ­s es requerido.")
            .MaximumLength(100).WithMessage("El nombre no debe exceder los 100 caracteres.");

        RuleFor(x => x.CodigoIso)
            .NotEmpty().WithMessage("El cÃ³digo ISO es requerido.")
            .Length(2, 3).WithMessage("El cÃ³digo ISO debe tener 2 o 3 caracteres.");
    }
}
