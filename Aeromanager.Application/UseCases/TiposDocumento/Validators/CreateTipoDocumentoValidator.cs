using FluentValidation;
using Aeromanager.Application.UseCases.TiposDocumento.Commands;

namespace Aeromanager.Application.UseCases.TiposDocumento.Validators;

public class CreateTipoDocumentoValidator : AbstractValidator<CreateTipoDocumentoCommand>
{
    public CreateTipoDocumentoValidator()
    {
        RuleFor(x => x.Codigo)
            .NotEmpty().WithMessage("El cÃ³digo es requerido.")
            .MaximumLength(10).WithMessage("El cÃ³digo no debe exceder los 10 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(50).WithMessage("El nombre no debe exceder los 50 caracteres.");

        RuleFor(x => x.LongitudMaxima)
            .GreaterThan(0).WithMessage("La longitud mÃ¡xima debe ser mayor a cero.");
    }
}
