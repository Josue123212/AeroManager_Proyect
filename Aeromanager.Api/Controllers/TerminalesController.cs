using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Terminales.Commands;
using Aeromanager.Application.UseCases.Terminales.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/terminales")]
public class TerminalesController(
    GetTerminalesQueryHandler queryHandler,
    CreateTerminalCommandHandler createHandler,
    UpdateTerminalCommandHandler updateHandler,
    IValidator<CreateTerminalCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TerminalDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await queryHandler.Handle(new GetTerminalesQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<TerminalDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await queryHandler.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<TerminalDto>> Create(
        CreateTerminalCommand command, CancellationToken cancellationToken)
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
    public async Task<ActionResult<TerminalDto>> Update(
        int id, UpdateTerminalCommand command, CancellationToken cancellationToken)
    {
        var item = await updateHandler.Handle(command with { Id = id }, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
