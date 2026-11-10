using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Pasajeros.Commands;

public record UpdatePasajeroCommand(
    int Id,
    string Nombres,
    string Apellidos,
    int TipoDocumentoId,
    string NumeroDocumento,
    string Email,
    string? Telefono,
    int NacionalidadPaisId,
    bool Activo
);

public class UpdatePasajeroCommandHandler
{
    private readonly IPasajeroRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePasajeroCommandHandler(IPasajeroRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PasajeroDto?> Handle(UpdatePasajeroCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        entity.Nombres = command.Nombres;
        entity.Apellidos = command.Apellidos;
        entity.TipoDocumentoId = command.TipoDocumentoId;
        entity.NumeroDocumento = command.NumeroDocumento;
        entity.Email = command.Email;
        entity.Telefono = command.Telefono;
        entity.NacionalidadPaisId = command.NacionalidadPaisId;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return new PasajeroDto(
            entity.Id,
            entity.Nombres,
            entity.Apellidos,
            entity.TipoDocumentoId,
            entity.NumeroDocumento,
            entity.Email,
            entity.Telefono,
            entity.NacionalidadPaisId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
