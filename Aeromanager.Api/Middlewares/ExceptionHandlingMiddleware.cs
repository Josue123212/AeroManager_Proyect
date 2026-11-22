using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Api.Middlewares;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Excepción capturada en ExceptionHandlingMiddleware: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, detailMessage) = ResolveStatusAndMessage(exception);

        var response = new
        {
            status = (int)statusCode,
            title = statusCode.ToString(),
            detail = detailMessage,
            message = detailMessage,
            timestamp = DateTime.UtcNow
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;
        return context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }

    private static (HttpStatusCode StatusCode, string Message) ResolveStatusAndMessage(Exception exception)
    {
        switch (exception)
        {
            case ValidationException validationException:
            {
                var errors = validationException.Errors?
                    .Select(e => e.ErrorMessage)
                    .Where(m => !string.IsNullOrWhiteSpace(m))
                    .ToList();

                var msg = errors is { Count: > 0 }
                    ? string.Join(" ", errors)
                    : validationException.Message;

                return (HttpStatusCode.BadRequest, msg);
            }

            case KeyNotFoundException:
                return (
                    HttpStatusCode.NotFound,
                    string.IsNullOrWhiteSpace(exception.Message)
                        ? "El recurso solicitado no fue encontrado."
                        : exception.Message);

            case UnauthorizedAccessException:
                return (
                    HttpStatusCode.Unauthorized,
                    string.IsNullOrWhiteSpace(exception.Message)
                        ? "No autorizado para realizar esta operación."
                        : exception.Message);

            case InvalidOperationException:
                return (HttpStatusCode.Conflict, exception.Message);

            case DbUpdateConcurrencyException:
                return (
                    HttpStatusCode.Conflict,
                    "Conflicto de concurrencia: el registro fue modificado simultáneamente por otra operación.");

            case DbUpdateException dbEx:
            {
                var raw = $"{dbEx.InnerException?.Message} {dbEx.Message}";
                if (raw.Contains("23505", StringComparison.OrdinalIgnoreCase) ||
                    raw.Contains("duplicate key", StringComparison.OrdinalIgnoreCase) ||
                    raw.Contains("llave duplicada", StringComparison.OrdinalIgnoreCase))
                {
                    return (
                        HttpStatusCode.Conflict,
                        "Conflicto de unicidad: ya existe un registro con esos datos únicos (código, correo, documento o identificador duplicado).");
                }

                if (raw.Contains("23503", StringComparison.OrdinalIgnoreCase) ||
                    raw.Contains("foreign key", StringComparison.OrdinalIgnoreCase) ||
                    raw.Contains("llave foránea", StringComparison.OrdinalIgnoreCase))
                {
                    return (
                        HttpStatusCode.Conflict,
                        "Conflicto de integridad referencial: el registro relacionado no existe o tiene dependencias activas asociadas.");
                }

                if (raw.Contains("23514", StringComparison.OrdinalIgnoreCase) ||
                    raw.Contains("check constraint", StringComparison.OrdinalIgnoreCase))
                {
                    return (
                        HttpStatusCode.BadRequest,
                        "Los datos enviados incumplen una restricción de validación en la base de datos.");
                }

                return (
                    HttpStatusCode.Conflict,
                    "No se pudo guardar la información debido a un conflicto de integridad en la base de datos.");
            }

            case ArgumentException or FormatException or JsonException:
                return (
                    HttpStatusCode.BadRequest,
                    "Los datos o parámetros enviados no tienen un formato válido.");

            default:
                return (
                    HttpStatusCode.InternalServerError,
                    "Ocurrió un error interno al procesar la solicitud.");
        }
    }
}
