using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Ciudades.Commands;
using Aeromanager.Application.UseCases.Ciudades.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/ciudades")]
public class CiudadesController(
    GetCiudadesQueryHandler queryHandler,
    CreateCiudadCommandHandler createHandler,
    UpdateCiudadCommandHandler updateHandler,
    IValidator<CreateCiudadCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CiudadDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetCiudadesQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CiudadDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<CiudadDto>> Create(CreateCiudadCommand command)
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
    public async Task<ActionResult<CiudadDto>> Update(int id, UpdateCiudadCommand command)
    {
        var item = await updateHandler.Handle(command with { Id = id });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}