using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Aerolineas.Commands;
using Aeromanager.Application.UseCases.Aerolineas.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/aerolineas")]
public class AerolineasController(
    GetAerolineasQueryHandler queryHandler,
    CreateAerolineaCommandHandler createHandler,
    UpdateAerolineaCommandHandler updateHandler,
    IValidator<CreateAerolineaCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AerolineaDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetAerolineasQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<AerolineaDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<AerolineaDto>> Create(
        CreateAerolineaCommand command)
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
    public async Task<ActionResult<AerolineaDto>> Update(
        int id, UpdateAerolineaCommand command)
    {
        var item = await updateHandler.Handle(command with { Id = id });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
