using Aeromanager.Application.DTOs;
using Aeromanager.Application.UseCases.AiAssistant.Commands;
using Microsoft.AspNetCore.Mvc;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/ai")]
public class AiAssistantController(AskAiAssistantCommandHandler aiHandler) : ControllerBase
{
    [HttpPost("consultar")]
    public async Task<ActionResult<AiAssistantResponseDto>> Consultar(AskAiAssistantCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.Pregunta))
        {
            return BadRequest(new { message = "La pregunta de consulta no puede estar vacía." });
        }

        var response = await aiHandler.Handle(command);
        return Ok(response);
    }
}