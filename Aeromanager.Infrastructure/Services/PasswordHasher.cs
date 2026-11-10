using System.Security.Cryptography;
using System.Text;
using Aeromanager.Application.Interfaces;

namespace Aeromanager.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }

    public bool VerifyPassword(string password, string passwordHash)
    {
        var computedHash = HashPassword(password);
        return string.Equals(computedHash, passwordHash, StringComparison.OrdinalIgnoreCase)
               || password == passwordHash;
    }
}
