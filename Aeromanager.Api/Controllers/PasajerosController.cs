using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Pasajeros.Commands;
using Aeromanager.Application.UseCases.Pasajeros.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/pasajeros")]
public class PasajerosController(
    GetPasajerosQueryHandler queryHandler,
    CreatePasajeroCommandHandler createHandler,
    UpdatePasajeroCommandHandler updateHandler,
    IValidator<CreatePasajeroCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PasajeroDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetPasajerosQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PasajeroDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<PasajeroDto>> Create(
        CreatePasajeroCommand command)
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
    public async Task<ActionResult<PasajeroDto>> Update(
        int id, UpdatePasajeroCommand command)
    {
        var item = await updateHandler.Handle(command with { Id = id });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
