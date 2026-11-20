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
    public async Task<ActionResult<IEnumerable<AsientoVueloDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetAsientosVueloQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AsientoVueloDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<AsientoVueloDto>> Create(
        CreateAsientoVueloCommand command)
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
    public async Task<ActionResult<AsientoVueloDto>> Update(
        int id, UpdateAsientoVueloCommand command)
    {
        var item = await updateHandler.Handle(command with { Id = id });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
