using FluentValidation;
using Aeromanager.Application.UseCases.Usuarios.Commands;

namespace Aeromanager.Application.UseCases.Usuarios.Validators;

public class CreateUsuarioValidator : AbstractValidator<CreateUsuarioCommand>
{
    public CreateUsuarioValidator()
    {
        RuleFor(x => x.NombreCompleto)
            .NotEmpty().WithMessage("El nombre completo es requerido.")
            .MaximumLength(150).WithMessage("El nombre completo no debe exceder los 150 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es requerido.")
            .EmailAddress().WithMessage("El formato del email no es válido.")
            .MaximumLength(150).WithMessage("El email no debe exceder los 150 caracteres.");

        RuleFor(x => x.PasswordHash)
            .NotEmpty().WithMessage("La contraseña es requerida.");
    }
}
