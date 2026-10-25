namespace Aeromanager.Application.DTOs;

public record UsuarioRolDto(
    int Id,
    int UsuarioId,
    int RolId,
    DateTime FechaAsignacion,
    bool Activo
);
