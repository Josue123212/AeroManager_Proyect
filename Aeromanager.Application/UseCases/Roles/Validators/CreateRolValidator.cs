using FluentValidation;
using Aeromanager.Application.UseCases.Roles.Commands;

namespace Aeromanager.Application.UseCases.Roles.Validators;

public class CreateRolValidator : AbstractValidator<CreateRolCommand>
{
    public CreateRolValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre del rol es requerido.")
            .MaximumLength(50).WithMessage("El nombre no debe exceder los 50 caracteres.");
    }
}
