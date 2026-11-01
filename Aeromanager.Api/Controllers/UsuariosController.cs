using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Usuarios.Commands;
using Aeromanager.Application.UseCases.Usuarios.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
public class UsuariosController(
    GetUsuariosQueryHandler queryHandler,
    CreateUsuarioCommandHandler createHandler,
    UpdateUsuarioCommandHandler updateHandler,
    IValidator<CreateUsuarioCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await queryHandler.Handle(new GetUsuariosQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UsuarioDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await queryHandler.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> Create(
        CreateUsuarioRequest request, CancellationToken cancellationToken)
    {
        var hash = new PasswordHasher<CreateUsuarioRequest>().HashPassword(request, request.Password);
        var command = new CreateUsuarioCommand(request.NombreCompleto, request.Email, hash, request.EstadoAcceso);
        var validation = await createValidator.ValidateAsync(command, cancellationToken);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }

            return ValidationProblem(ModelState);
        }

        var item = await createHandler.Handle(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UsuarioDto>> Update(
        int id, UpdateUsuarioCommand command, CancellationToken cancellationToken)
    {
        var item = await updateHandler.Handle(command with { Id = id }, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    public record CreateUsuarioRequest(
        [Required] string NombreCompleto,
        [Required] string Email,
        [Required] string Password,
        [Required] string EstadoAcceso = "ACTIVO");
}
