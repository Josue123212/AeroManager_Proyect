namespace Aeromanager.Application.Interfaces;

public interface IAiAssistantService
{
    Task<string> ConsultarAsistenteOperativoAsync(string preguntaUsuario, string contextoOperativo);
}
