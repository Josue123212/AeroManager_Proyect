using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.Vuelos.Commands;
using Aeromanager.Application.UseCases.Vuelos.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/vuelos")]
public class VuelosController(
    GetVuelosQueryHandler queryHandler,
    CreateVueloCommandHandler createHandler,
    UpdateVueloCommandHandler updateHandler,
    IValidator<CreateVueloCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VueloDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetVuelosQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<VueloDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<VueloDto>> Create(
        CreateVueloCommand command)
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
    public async Task<ActionResult<VueloDto>> Update(
        int id, UpdateVueloCommand command)
    {
        var callerIsSuperAdmin = User.IsInRole("SuperAdmin");
        var item = await updateHandler.Handle(command with { Id = id, CallerIsSuperAdmin = callerIsSuperAdmin });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
