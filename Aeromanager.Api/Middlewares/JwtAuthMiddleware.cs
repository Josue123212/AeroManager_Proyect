using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace Aeromanager.Api.Middlewares;

public sealed class BearerAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IConfiguration configuration)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(authHeader) ||
            !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var token = authHeader["Bearer ".Length..].Trim();
        var principal = ValidateToken(token);
        if (principal is null)
        {
            return Task.FromResult(AuthenticateResult.Fail("Token JWT inválido o expirado."));
        }

        var ticket = new AuthenticationTicket(principal, Scheme.Name);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }

    protected override async Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        Response.ContentType = "application/json";
        await Response.WriteAsync(JsonSerializer.Serialize(new
        {
            status = 401,
            title = "Unauthorized",
            detail = "Debe iniciar sesión con un token JWT válido para acceder a este recurso.",
            timestamp = DateTime.UtcNow
        }));
    }

    protected override async Task HandleForbiddenAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status403Forbidden;
        Response.ContentType = "application/json";
        await Response.WriteAsync(JsonSerializer.Serialize(new
        {
            status = 403,
            title = "Forbidden",
            detail = "No tiene permisos suficientes para acceder a este recurso.",
            timestamp = DateTime.UtcNow
        }));
    }

    private ClaimsPrincipal? ValidateToken(string token)
    {
        var parts = token.Split('.');
        if (parts.Length != 3)
        {
            return null;
        }

        var secret = configuration["JwtSettings:SecretKey"] ?? "AeroManager_SuperSecretKey_2026_Tecsup_FinalProject!";
        var unsignedToken = $"{parts[0]}.{parts[1]}";

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var expectedSignature = Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(unsignedToken)));

        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expectedSignature),
                Encoding.UTF8.GetBytes(parts[2])))
        {
            return null;
        }

        try
        {
            var payloadBytes = Base64UrlDecode(parts[1]);
            using var doc = JsonDocument.Parse(payloadBytes);
            var root = doc.RootElement;

            if (root.TryGetProperty("exp", out var expEl) && expEl.TryGetInt64(out var exp))
            {
                if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() >= exp)
                {
                    return null;
                }
            }

            var claims = new List<Claim>();
            if (root.TryGetProperty("sub", out var subEl) && subEl.ValueKind == JsonValueKind.String)
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, subEl.GetString()!));
            }
            if (root.TryGetProperty("email", out var emailEl) && emailEl.ValueKind == JsonValueKind.String)
            {
                claims.Add(new Claim(ClaimTypes.Email, emailEl.GetString()!));
            }
            if (root.TryGetProperty("name", out var nameEl) && nameEl.ValueKind == JsonValueKind.String)
            {
                claims.Add(new Claim(ClaimTypes.Name, nameEl.GetString()!));
            }
            if (root.TryGetProperty("roles", out var rolesEl) && rolesEl.ValueKind == JsonValueKind.Array)
            {
                foreach (var role in rolesEl.EnumerateArray())
                {
                    var roleName = role.GetString();
                    if (!string.IsNullOrWhiteSpace(roleName))
                    {
                        claims.Add(new Claim(ClaimTypes.Role, roleName));
                    }
                }
            }

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            return new ClaimsPrincipal(identity);
        }
        catch
        {
            return null;
        }
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private static byte[] Base64UrlDecode(string input)
    {
        var padded = input.Replace('-', '+').Replace('_', '/');
        switch (padded.Length % 4)
        {
            case 2: padded += "=="; break;
            case 3: padded += "="; break;
        }
        return Convert.FromBase64String(padded);
    }
}
