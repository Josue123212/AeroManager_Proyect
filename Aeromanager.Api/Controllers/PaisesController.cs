
using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Paises.Commands;
using Aeromanager.Application.UseCases.Paises.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/paises")]
public class PaisesController(
    GetPaisesQueryHandler queryHandler,
    CreatePaisCommandHandler createHandler,
    UpdatePaisCommandHandler updateHandler,
    IValidator<CreatePaisCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PaisDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetPaisesQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PaisDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<PaisDto>> Create(
        CreatePaisCommand command)
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
    public async Task<ActionResult<PaisDto>> Update(
        int id, UpdatePaisCommand command)
    {
        var item = await updateHandler.Handle(command with { Id = id });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}

