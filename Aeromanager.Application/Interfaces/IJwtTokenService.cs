using Aeromanager.Domain.Entities;

namespace Aeromanager.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(Usuario usuario, IEnumerable<string> roles);
}
