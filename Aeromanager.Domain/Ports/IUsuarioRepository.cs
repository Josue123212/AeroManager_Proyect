using Aeromanager.Domain.Entities;

namespace Aeromanager.Domain.Ports;

public interface IUsuarioRepository : IGenericRepository<Usuario>
{
    Task<Usuario?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<Usuario?> GetUsuarioConRolesAsync(int usuarioId, CancellationToken cancellationToken = default);
}

