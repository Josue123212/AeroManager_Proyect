using Aeromanager.Application.DTOs;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;

namespace Aeromanager.Application.UseCases.TiposDocumento.Commands;

public record UpdateTipoDocumentoCommand(
    int Id,
    string Codigo,
    string Nombre,
    int LongitudMaxima,
    bool Activo
);

public class UpdateTipoDocumentoCommandHandler
{
    private readonly IGenericRepository<TipoDocumento> _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTipoDocumentoCommandHandler(IGenericRepository<TipoDocumento> repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TipoDocumentoDto?> Handle(UpdateTipoDocumentoCommand command, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(command.Id);
        if (entity == null) return null;

        entity.Codigo = command.Codigo;
        entity.Nombre = command.Nombre;
        entity.LongitudMaxima = command.LongitudMaxima;
        entity.Activo = command.Activo;

        _repository.Update(entity);
        await _unitOfWork.SaveChangesAsync();

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
