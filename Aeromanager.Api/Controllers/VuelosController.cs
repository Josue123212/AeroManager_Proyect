using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Vuelos.Commands;
using Aeromanager.Application.UseCases.Vuelos.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/vuelos")]
public class VuelosController(
    GetVuelosQueryHandler queryHandler,
    CreateVueloCommandHandler createHandler,
    UpdateVueloCommandHandler updateHandler,
    IValidator<CreateVueloCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VueloDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await queryHandler.Handle(new GetVuelosQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VueloDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await queryHandler.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<VueloDto>> Create(
        CreateVueloCommand command, CancellationToken cancellationToken)
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
    public async Task<ActionResult<VueloDto>> Update(
        int id, UpdateVueloCommand command, CancellationToken cancellationToken)
    {
        var item = await updateHandler.Handle(command with { Id = id }, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
