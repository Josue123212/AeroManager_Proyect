using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Aviones.Commands;
using Aeromanager.Application.UseCases.Aviones.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/aviones")]
public class AvionesController(
    GetAvionesQueryHandler queryHandler,
    CreateAvionCommandHandler createHandler,
    UpdateAvionCommandHandler updateHandler,
    IValidator<CreateAvionCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AvionDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await queryHandler.Handle(new GetAvionesQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AvionDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await queryHandler.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<AvionDto>> Create(
        CreateAvionCommand command, CancellationToken cancellationToken)
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
    public async Task<ActionResult<AvionDto>> Update(
        int id, UpdateAvionCommand command, CancellationToken cancellationToken)
    {
        var item = await updateHandler.Handle(command with { Id = id }, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
