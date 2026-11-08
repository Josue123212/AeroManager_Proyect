using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Aerolineas.Commands;

public record UpdateAerolineaCommand(
    int Id,
    string Nombre,
    string CodigoIata,
    int PaisOrigenId,
    bool Activo
);

public class UpdateAerolineaCommandHandler
{
    private readonly IGenericRepository<Aerolinea> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateAerolineaCommandHandler(IGenericRepository<Aerolinea> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AerolineaDto?> Handle(UpdateAerolineaCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        entity.Nombre = command.Nombre;
        entity.CodigoIata = command.CodigoIata.ToUpperInvariant();
        entity.PaisOrigenId = command.PaisOrigenId;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

        return new AerolineaDto(
            entity.Id,
            entity.Nombre,
            entity.CodigoIata,
            entity.PaisOrigenId,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
