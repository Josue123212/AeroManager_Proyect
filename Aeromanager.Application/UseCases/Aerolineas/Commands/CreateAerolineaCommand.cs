using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.Aerolineas.Commands;

public record CreateAerolineaCommand(
    string Nombre,
    string CodigoIata,
    int PaisOrigenId
);

public class CreateAerolineaCommandHandler
{
    private readonly IGenericRepository<Aerolinea> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateAerolineaCommandHandler(IGenericRepository<Aerolinea> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<AerolineaDto> Handle(CreateAerolineaCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new Aerolinea
        {
            Nombre = command.Nombre,
            CodigoIata = command.CodigoIata.ToUpperInvariant(),
            PaisOrigenId = command.PaisOrigenId,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity);
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
