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
    public async Task<ActionResult<IEnumerable<AeropuertoDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetAeropuertosQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AeropuertoDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<AeropuertoDto>> Create(
        CreateAeropuertoCommand command)
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
    public async Task<ActionResult<AeropuertoDto>> Update(
        int id, UpdateAeropuertoCommand command)
    {
        var item = await updateHandler.Handle(command with { Id = id });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
