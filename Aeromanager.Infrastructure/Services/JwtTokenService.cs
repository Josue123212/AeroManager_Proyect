using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Aeromanager.Application.Interfaces;
using Aeromanager.Domain.Entities;
using Microsoft.Extensions.Configuration;

namespace Aeromanager.Infrastructure.Services;

public class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    public string GenerateToken(Usuario usuario, IEnumerable<string> roles)
    {
        var secret = configuration["JwtSettings:SecretKey"] ?? "AeroManager_SuperSecretKey_2026_Tecsup_FinalProject!";
        var headerJson = JsonSerializer.Serialize(new { alg = "HS256", typ = "JWT" });
        var payloadJson = JsonSerializer.Serialize(new
        {
            sub = usuario.Id.ToString(),
            email = usuario.Email,
            name = usuario.NombreCompleto,
            roles = roles.ToArray(),
            exp = DateTimeOffset.UtcNow.AddHours(8).ToUnixTimeSeconds()
        });

        var headerBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
        var payloadBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
        var unsignedToken = $"{headerBase64}.{payloadBase64}";

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(unsignedToken));
        var signatureBase64 = Base64UrlEncode(signatureBytes);

        return $"{unsignedToken}.{signatureBase64}";
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }
}
