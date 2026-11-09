using FluentValidation;
using Aeromanager.Application.UseCases.Reservas.Commands;

namespace Aeromanager.Application.UseCases.Reservas.Validators;

public class CreateReservaValidator : AbstractValidator<CreateReservaCommand>
{
    public CreateReservaValidator()
    {
        RuleFor(x => x.CodigoTicket)
            .NotEmpty().WithMessage("El cÃ³digo de ticket es requerido.")
            .MaximumLength(30).WithMessage("El cÃ³digo no debe superar 30 caracteres.");

        RuleFor(x => x.VueloId).GreaterThan(0).WithMessage("El VueloId es requerido.");
        RuleFor(x => x.UsuarioRegistroId).GreaterThan(0).WithMessage("El UsuarioRegistroId es requerido.");
        RuleFor(x => x.MontoTotal).GreaterThanOrEqualTo(0).WithMessage("El monto total no puede ser negativo.");
    }
}
