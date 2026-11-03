using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.AsientosVuelo.Commands;
using Aeromanager.Application.UseCases.AsientosVuelo.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/asientosvuelo")]
public class AsientosVueloController(
    GetAsientosVueloQueryHandler queryHandler,
    CreateAsientoVueloCommandHandler createHandler,
    UpdateAsientoVueloCommandHandler updateHandler,
    IValidator<CreateAsientoVueloCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AsientoVueloDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await queryHandler.Handle(new GetAsientosVueloQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AsientoVueloDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await queryHandler.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<AsientoVueloDto>> Create(
        CreateAsientoVueloCommand command, CancellationToken cancellationToken)
    {
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
    public async Task<ActionResult<AsientoVueloDto>> Update(
        int id, UpdateAsientoVueloCommand command, CancellationToken cancellationToken)
    {
        var item = await updateHandler.Handle(command with { Id = id }, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
