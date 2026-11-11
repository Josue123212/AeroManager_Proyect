using Aeromanager.Application.Interfaces;
using Aeromanager.Domain.Ports;
using Aeromanager.Infrastructure.Persistence;
using Aeromanager.Infrastructure.Repositories;
using Aeromanager.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Aeromanager.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration? configuration = null)
    {
        if (configuration != null)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection")
                                   ?? configuration.GetConnectionString("AeroManagerConnection");

            if (!string.IsNullOrWhiteSpace(connectionString))
            {
                services.AddDbContext<AeroManagerDbContext>(options =>
                    options.UseNpgsql(connectionString));
            }
        }

        // Adaptadores Primarios (Repositorios -> Interfaces en Domain.Ports)
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IAeropuertoRepository, AeropuertoRepository>();
        services.AddScoped<IAvionRepository, AvionRepository>();
        services.AddScoped<IRutaRepository, RutaRepository>();
        services.AddScoped<IVueloRepository, VueloRepository>();
        services.AddScoped<IAsientoVueloRepository, AsientoVueloRepository>();
        services.AddScoped<IReservaRepository, ReservaRepository>();
        services.AddScoped<IPasajeroRepository, PasajeroRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();

        // Adaptadores Secundarios (Servicios Técnicos/Externos -> Interfaces en Application.Interfaces)
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IExcelReportService, ExcelReportService>();
        services.AddHttpClient<IAiAssistantService, GeminiAiService>();

        return services;
    }
}
