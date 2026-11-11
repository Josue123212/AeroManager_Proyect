using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Reservas.Commands;
using Aeromanager.Application.UseCases.Reservas.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/reservas")]
public class ReservasController(
    GetReservasQueryHandler queryHandler,
    CreateReservaCommandHandler createHandler,
    UpdateReservaCommandHandler updateHandler,
    IValidator<CreateReservaCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservaDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetReservasQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservaDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<ReservaDto>> Create(
        CreateReservaCommand command)
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
    public async Task<ActionResult<ReservaDto>> Update(
        int id, UpdateReservaCommand command)
    {
        var item = await updateHandler.Handle(command with { Id = id });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
