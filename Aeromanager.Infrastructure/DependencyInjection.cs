using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;
using Aeromanager.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aeromanager.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? Environment.GetEnvironmentVariable("AEROMANAGER_CONNECTION_STRING");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return services;
        }

        services.AddDbContext<AeroManagerDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IAeropuertoRepository, AeropuertoRepository>();
        services.AddScoped<IAsientoVueloRepository, AsientoVueloRepository>();
        services.AddScoped<IAvionRepository, AvionRepository>();
        services.AddScoped<IPasajeroRepository, PasajeroRepository>();
        services.AddScoped<IReservaRepository, ReservaRepository>();
        services.AddScoped<IRutaRepository, RutaRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IVueloRepository, VueloRepository>();

        return services;
    }
}
