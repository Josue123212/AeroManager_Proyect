using Aeromanager.Application.DTOs;
using Aeromanager.Application.Interfaces;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Auth.Commands;

public record LoginCommand(string Email, string Password);

public class LoginCommandHandler(
    IUsuarioRepository usuarioRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService)
{
    public async Task<LoginResponseDto?> Handle(LoginCommand command, CancellationToken cancellationToken = default)
    {
        var usuario = await usuarioRepository.GetByEmailAsync(command.Email);
        if (usuario is null ||
            !usuario.Activo ||
            !string.Equals(usuario.EstadoAcceso?.Trim(), "Activo", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        if (!passwordHasher.VerifyPassword(command.Password, usuario.PasswordHash))
        {
            return null;
        }

        var usuarioConRoles = await usuarioRepository.GetUsuarioConRolesAsync(usuario.Id);
        var roles = usuarioConRoles?.UsuarioRol
            .Where(ur => ur.Activo && ur.Rol is not null)
            .Select(ur => ur.Rol.Nombre)
            .ToList() ?? ["Administrador"];

        var token = jwtTokenService.GenerateToken(usuario, roles);

        return new LoginResponseDto(
            usuario.Id,
            usuario.NombreCompleto,
            usuario.Email,
            token,
            roles
        );
    }
}
