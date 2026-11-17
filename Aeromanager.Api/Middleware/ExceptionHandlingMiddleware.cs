using System.Net;
using System.Text.Json;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Api.Middleware;

public sealed class ExceptionHandlingMiddleware(
    RequestDelegate next,
    ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = exception switch
        {
            ValidationException validationException =>
                (HttpStatusCode.BadRequest,
                string.Join(" ", validationException.Errors.Select(error => error.ErrorMessage))),
            KeyNotFoundException =>
                (HttpStatusCode.NotFound,
                "El recurso solicitado no fue encontrado."),
            ArgumentException =>
                (HttpStatusCode.BadRequest,
                "Los datos enviados no son válidos."),
            DbUpdateException =>
                (HttpStatusCode.Conflict,
                "No se pudo actualizar la información debido a un conflicto de datos."),
            _ =>
                (HttpStatusCode.InternalServerError,
                "Ocurrió un error inesperado.")
        };

        if (statusCode == HttpStatusCode.InternalServerError)
        {
            logger.LogError(exception, "Error inesperado al procesar {Method} {Path}",
                context.Request.Method, context.Request.Path);
        }
        else
        {
            logger.LogWarning(exception, "Solicitud rechazada: {Method} {Path}",
                context.Request.Method, context.Request.Path);
        }

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = (int)statusCode,
            message
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));
    }
}
