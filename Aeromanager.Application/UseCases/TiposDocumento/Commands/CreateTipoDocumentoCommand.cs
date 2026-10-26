using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.TiposDocumento.Commands;

public record CreateTipoDocumentoCommand(
    string Codigo,
    string Nombre,
    int LongitudMaxima
);

public class CreateTipoDocumentoCommandHandler
{
    private readonly IGenericRepository<TipoDocumento> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTipoDocumentoCommandHandler(IGenericRepository<TipoDocumento> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TipoDocumentoDto> Handle(CreateTipoDocumentoCommand command, CancellationToken cancellationToken = default)
    {
        var entity = new TipoDocumento
        {
            Codigo = command.Codigo,
            Nombre = command.Nombre,
            LongitudMaxima = command.LongitudMaxima,
            FechaCreacion = DateTime.UtcNow,
            Activo = true
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new TipoDocumentoDto(
            entity.Id,
            entity.Codigo,
            entity.Nombre,
            entity.LongitudMaxima,
            entity.FechaCreacion,
            entity.Activo
        );
    }
}
