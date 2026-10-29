using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Pasajeros.Commands;

public record CreatePasajeroCommand(
    string Nombres,
    string Apellidos,
    int TipoDocumentoId,
    string NumeroDocumento,
    string Email,
    string? Telefono,
    int NacionalidadPaisId
);

public class CreatePasajeroCommandHandler
{
    private readonly IPasajeroRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePasajeroCommandHandler(IPasajeroRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<PasajeroDto> Handle(CreatePasajeroCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Pasajero
        {
            Nombres = command.Nombres,
            Apellidos = command.Apellidos,
            TipoDocumentoId = command.TipoDocumentoId,
            NumeroDocumento = command.NumeroDocumento,
            Email = command.Email,
            Telefono = command.Telefono,
            NacionalidadPaisId = command.NacionalidadPaisId,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
