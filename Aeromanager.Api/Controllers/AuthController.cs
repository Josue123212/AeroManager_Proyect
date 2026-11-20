using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Auth.Commands;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(
    LoginCommandHandler loginHandler,
    IValidator<LoginCommand> loginValidator) : ControllerBase
{
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginCommand command)
    {
        var validation = await loginValidator.ValidateAsync(command);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }

            return ValidationProblem(ModelState);
        }

        var result = await loginHandler.Handle(command);
        if (result is null)
        {
            return Unauthorized(new { message = "Credenciales inválidas o usuario inactivo." });
        }

        return Ok(result);
    }
}