using System.Linq.Expressions;
using Aeromanager.Domain.Entities;
using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Infrastructure.Repositories;

public class GenericRepository<T> : IGenericRepository<T> where T : class
{
    protected readonly AeroManagerDbContext DbContext;
    protected readonly DbSet<T> DbSet;

    public GenericRepository(AeroManagerDbContext dbContext)
    {
        DbContext = dbContext;
        DbSet = dbContext.Set<T>();
    }

    public async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet.FindAsync(new object[] { id }, cancellationToken).AsTask();
    }

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default)
    {
        return await DbSet.AsNoTracking().Where(predicate).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(entity, cancellationToken);
    }

    public void Update(T entity)
    {
        DbSet.Update(entity);
    }

    public void Remove(T entity)
    {
        DbSet.Remove(entity);
    }
}

public class AeropuertoRepository : GenericRepository<Aeropuerto>, IAeropuertoRepository
{
    public AeropuertoRepository(AeroManagerDbContext dbContext) : base(dbContext) { }

    public async Task<Aeropuerto?> GetByCodigoIataAsync(string codigoIata, CancellationToken cancellationToken = default)
    {
        return await DbContext.Aeropuerto
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.CodigoIata == codigoIata, cancellationToken);
    }

    public async Task<bool> ExistsByCodigoIataAsync(string codigoIata, CancellationToken cancellationToken = default)
    {
        return await DbContext.Aeropuerto
            .AnyAsync(x => x.CodigoIata == codigoIata, cancellationToken);
    }
}

public class AsientoVueloRepository : GenericRepository<AsientoVuelo>, IAsientoVueloRepository
{
    public AsientoVueloRepository(AeroManagerDbContext dbContext) : base(dbContext) { }

    public async Task<IEnumerable<AsientoVuelo>> GetAsientosDisponiblesPorVueloAsync(int vueloId, CancellationToken cancellationToken = default)
    {
        return await DbContext.AsientoVuelo
            .AsNoTracking()
            .Where(x => x.VueloId == vueloId && x.Activo && !x.EstaOcupado)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> EstaAsientoDisponibleAsync(int asientoVueloId, CancellationToken cancellationToken = default)
    {
        return await DbContext.AsientoVuelo
            .AnyAsync(x => x.Id == asientoVueloId && x.Activo && !x.EstaOcupado, cancellationToken);
    }
}

public class AvionRepository : GenericRepository<Avion>, IAvionRepository
{
    public AvionRepository(AeroManagerDbContext dbContext) : base(dbContext) { }

    public async Task<Avion?> GetByMatriculaAsync(string matricula, CancellationToken cancellationToken = default)
    {
        return await DbContext.Avion
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Matricula == matricula, cancellationToken);
    }

    public async Task<bool> ExistsByMatriculaAsync(string matricula, CancellationToken cancellationToken = default)
    {
        return await DbContext.Avion
            .AnyAsync(x => x.Matricula == matricula, cancellationToken);
    }
}

public class PasajeroRepository : GenericRepository<Pasajero>, IPasajeroRepository
{
    public PasajeroRepository(AeroManagerDbContext dbContext) : base(dbContext) { }

    public async Task<Pasajero?> GetByDocumentoAsync(int tipoDocumentoId, string numeroDocumento, CancellationToken cancellationToken = default)
    {
        return await DbContext.Pasajero
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.TipoDocumentoId == tipoDocumentoId && x.NumeroDocumento == numeroDocumento, cancellationToken);
    }
}

public class ReservaRepository : GenericRepository<Reserva>, IReservaRepository
{
    public ReservaRepository(AeroManagerDbContext dbContext) : base(dbContext) { }

    public async Task<Reserva?> GetByCodigoTicketAsync(string codigoTicket, CancellationToken cancellationToken = default)
    {
        return await DbContext.Reserva
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.CodigoTicket == codigoTicket, cancellationToken);
    }

    public async Task<IEnumerable<Reserva>> GetReservasPorVueloAsync(int vueloId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Reserva
            .AsNoTracking()
            .Where(x => x.VueloId == vueloId)
            .ToListAsync(cancellationToken);
    }
}

public class RutaRepository : GenericRepository<Ruta>, IRutaRepository
{
    public RutaRepository(AeroManagerDbContext dbContext) : base(dbContext) { }

    public async Task<Ruta?> GetByCodigoRutaAsync(string codigoRuta, CancellationToken cancellationToken = default)
    {
        return await DbContext.Ruta
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.CodigoRuta == codigoRuta, cancellationToken);
    }

    public async Task<IEnumerable<Ruta>> GetByAeropuertosAsync(int origenId, int destinoId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Ruta
            .AsNoTracking()
            .Where(x => x.AeropuertoOrigenId == origenId && x.AeropuertoDestinoId == destinoId)
            .ToListAsync(cancellationToken);
    }
}

public class UsuarioRepository : GenericRepository<Usuario>, IUsuarioRepository
{
    public UsuarioRepository(AeroManagerDbContext dbContext) : base(dbContext) { }

    public async Task<Usuario?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await DbContext.Usuario
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
    }

    public async Task<Usuario?> GetUsuarioConRolesAsync(int usuarioId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Usuario
            .Include(x => x.UsuarioRol)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == usuarioId, cancellationToken);
    }
}

public class VueloRepository : GenericRepository<Vuelo>, IVueloRepository
{
    public VueloRepository(AeroManagerDbContext dbContext) : base(dbContext) { }

    public async Task<IEnumerable<Vuelo>> GetVuelosProgramadosPorFechaAsync(DateTime fecha, CancellationToken cancellationToken = default)
    {
        return await DbContext.Vuelo
            .AsNoTracking()
            .Where(x => x.FechaHoraSalida.Date == fecha.Date)
            .ToListAsync(cancellationToken);
    }

    public async Task<Vuelo?> GetVueloConDisponibilidadAsync(int vueloId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Vuelo
            .Include(x => x.AsientoVuelo)
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == vueloId, cancellationToken);
    }
}
