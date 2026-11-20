using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.PuertasEmbarque.Commands;
using Aeromanager.Application.UseCases.PuertasEmbarque.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/puertasembarque")]
public class PuertasEmbarqueController(
    GetPuertasEmbarqueQueryHandler queryHandler,
    CreatePuertaEmbarqueCommandHandler createHandler,
    UpdatePuertaEmbarqueCommandHandler updateHandler,
    IValidator<CreatePuertaEmbarqueCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PuertaEmbarqueDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetPuertasEmbarqueQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PuertaEmbarqueDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<PuertaEmbarqueDto>> Create(
        CreatePuertaEmbarqueCommand command)
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
    public async Task<ActionResult<PuertaEmbarqueDto>> Update(
        int id, UpdatePuertaEmbarqueCommand command)
    {
        var item = await updateHandler.Handle(command with { Id = id });
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }
}
