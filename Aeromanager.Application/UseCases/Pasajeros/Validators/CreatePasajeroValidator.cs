using FluentValidation;
using Aeromanager.Application.UseCases.Pasajeros.Commands;

namespace Aeromanager.Application.UseCases.Pasajeros.Validators;

public class CreatePasajeroValidator : AbstractValidator<CreatePasajeroCommand>
{
    public CreatePasajeroValidator()
    {
        RuleFor(x => x.Nombres)
            .NotEmpty().WithMessage("Los nombres son requeridos.")
            .MaximumLength(100).WithMessage("Los nombres no deben superar 100 caracteres.");

        RuleFor(x => x.Apellidos)
            .NotEmpty().WithMessage("Los apellidos son requeridos.")
            .MaximumLength(100).WithMessage("Los apellidos no deben superar 100 caracteres.");

        RuleFor(x => x.TipoDocumentoId).GreaterThan(0).WithMessage("El TipoDocumentoId es requerido.");

        RuleFor(x => x.NumeroDocumento)
            .NotEmpty().WithMessage("El número de documento es requerido.")
            .MaximumLength(30).WithMessage("El número de documento no debe superar 30 caracteres.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("El email es requerido.")
            .EmailAddress().WithMessage("El email no tiene un formato válido.")
            .MaximumLength(150).WithMessage("El email no debe superar 150 caracteres.");

        RuleFor(x => x.NacionalidadPaisId).GreaterThan(0).WithMessage("La nacionalidad es requerida.");
    }
}
