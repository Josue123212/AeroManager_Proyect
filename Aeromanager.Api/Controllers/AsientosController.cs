using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Asientos.Commands;
using Aeromanager.Application.UseCases.Asientos.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/asientos")]
public class AsientosController(
    GetAsientosQueryHandler queryHandler,
    CreateAsientoCommandHandler createHandler,
    UpdateAsientoCommandHandler updateHandler,
    IValidator<CreateAsientoCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AsientoDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetAsientosQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AsientoDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<AsientoDto>> Create(
        CreateAsientoCommand command)
    {
        var validation = await createValidator.ValidateAsync(command);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }

            return ValidationProblem(ModelState);
        }

        var item = await createHandler.Handle(command);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<AsientoDto>> Update(
        int id, UpdateAsientoCommand command)
    {
        var item = await updateHandler.Handle(command with { Id = id });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
