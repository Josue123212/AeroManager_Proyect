using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Aeropuertos.Commands;
using Aeromanager.Application.UseCases.Aeropuertos.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/aeropuertos")]
public class AeropuertosController(
    GetAeropuertosQueryHandler queryHandler,
    CreateAeropuertoCommandHandler createHandler,
    UpdateAeropuertoCommandHandler updateHandler,
    IValidator<CreateAeropuertoCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AeropuertoDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await queryHandler.Handle(new GetAeropuertosQuery(), cancellationToken);
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AeropuertoDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var item = await queryHandler.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<AeropuertoDto>> Create(
        CreateAeropuertoCommand command, CancellationToken cancellationToken)
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
    public async Task<ActionResult<AeropuertoDto>> Update(
        int id, UpdateAeropuertoCommand command, CancellationToken cancellationToken)
    {
        var item = await updateHandler.Handle(command with { Id = id }, cancellationToken);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
