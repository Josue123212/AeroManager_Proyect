using FluentValidation;
using Aeromanager.Application.UseCases.UsuarioRoles.Commands;

namespace Aeromanager.Application.UseCases.UsuarioRoles.Validators;

public class CreateUsuarioRolValidator : AbstractValidator<CreateUsuarioRolCommand>
{
    public CreateUsuarioRolValidator()
    {
        RuleFor(x => x.UsuarioId).GreaterThan(0).WithMessage("El UsuarioId debe ser mayor a cero.");
        RuleFor(x => x.RolId).GreaterThan(0).WithMessage("El RolId debe ser mayor a cero.");
    }
}
