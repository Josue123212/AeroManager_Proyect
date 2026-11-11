using System.Diagnostics;

namespace Aeromanager.Api.Middlewares;

public class RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var method = context.Request.Method;
        var path = context.Request.Path;

        await next(context);

        stopwatch.Stop();
        logger.LogInformation(
            "HTTP {Method} {Path} respondió {StatusCode} en {ElapsedMs} ms",
            method, path, context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
    }
}