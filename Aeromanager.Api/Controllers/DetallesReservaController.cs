using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.DetallesReserva.Commands;
using Aeromanager.Application.UseCases.DetallesReserva.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/detallesreserva")]
public class DetallesReservaController(
    GetDetallesReservaQueryHandler queryHandler,
    CreateDetalleReservaCommandHandler createHandler,
    UpdateDetalleReservaCommandHandler updateHandler,
    IValidator<CreateDetalleReservaCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DetalleReservaDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetDetallesReservaQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<DetalleReservaDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<DetalleReservaDto>> Create(
        CreateDetalleReservaCommand command)
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
    public async Task<ActionResult<DetalleReservaDto>> Update(
        int id, UpdateDetalleReservaCommand command)
    {
        var item = await updateHandler.Handle(command with { Id = id });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
