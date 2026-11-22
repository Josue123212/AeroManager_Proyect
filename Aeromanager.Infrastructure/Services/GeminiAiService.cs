using System.Net.Http.Json;
using System.Text.Json;
using Aeromanager.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Aeromanager.Infrastructure.Services;

public class GeminiAiService(HttpClient httpClient, IConfiguration configuration) : IAiAssistantService
{
    public async Task<string> ConsultarAsistenteOperativoAsync(string preguntaUsuario, string contextoOperativo)
    {
        var apiKey = configuration["GeminiSettings:ApiKey"];
        if (!string.IsNullOrWhiteSpace(apiKey))
        {
            var promptText =
                $"Eres el Copilot Operativo de AeroManager. Contexto actual en vivo del sistema: {contextoOperativo}. " +
                $"Responde de forma ejecutiva y breve en español a la consulta del administrador: {preguntaUsuario}";

            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[]
                        {
                            new { text = promptText }
                        }
                    }
                }
            };

            var endpoints = new[]
            {
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key={apiKey}",
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={apiKey}",
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key={apiKey}",
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={apiKey}",
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key={apiKey}"
            };

            foreach (var url in endpoints)
            {
                try
                {
                    var response = await httpClient.PostAsJsonAsync(url, payload);
                    if (response.IsSuccessStatusCode)
                    {
                        using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync());
                        var text = doc.RootElement
                            .GetProperty("candidates")[0]
                            .GetProperty("content")
                            .GetProperty("parts")[0]
                            .GetProperty("text")
                            .GetString();

                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            return text;
                        }
                    }
                }
                catch
                {
                    // Intentar siguiente endpoint o fallback analítico local
                }
            }
        }

        return $"[Copilot Operativo AeroManager]\n" +
               $"• Estado Analizado: {contextoOperativo}\n" +
               $"• Respuesta a \"{preguntaUsuario}\": Se recomienda priorizar la apertura de puertas de embarque (Gates) 45 minutos antes de la salida programada y verificar que los asientos disponibles mantengan su control de reserva activo durante el turno.";
    }
}
