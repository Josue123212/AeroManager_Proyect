using FluentValidation;
using Aeromanager.Application.UseCases.Aeropuertos.Commands;

namespace Aeromanager.Application.UseCases.Aeropuertos.Validators;

public class CreateAeropuertoValidator : AbstractValidator<CreateAeropuertoCommand>
{
    public CreateAeropuertoValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre del aeropuerto es requerido.")
            .MaximumLength(150).WithMessage("El nombre no debe superar 150 caracteres.");

        RuleFor(x => x.CodigoIata)
            .NotEmpty().WithMessage("El código IATA es requerido.")
            .Length(3).WithMessage("El código IATA debe tener exactamente 3 caracteres.");

        RuleFor(x => x.CiudadId).GreaterThan(0).WithMessage("El CiudadId debe ser mayor a cero.");
    }
}
