using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Aeromanager.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        AssemblyScanner.FindValidatorsInAssembly(typeof(DependencyInjection).Assembly)
            .ForEach(item => services.AddScoped(item.InterfaceType, item.ValidatorType));

        // Usuarios
        services.AddScoped<UseCases.Usuarios.Commands.CreateUsuarioCommandHandler>();
        services.AddScoped<UseCases.Usuarios.Commands.UpdateUsuarioCommandHandler>();
        services.AddScoped<UseCases.Usuarios.Queries.GetUsuariosQueryHandler>();

        // Roles
        services.AddScoped<UseCases.Roles.Commands.CreateRolCommandHandler>();
        services.AddScoped<UseCases.Roles.Commands.UpdateRolCommandHandler>();
        services.AddScoped<UseCases.Roles.Queries.GetRolesQueryHandler>();

        // UsuarioRoles
        services.AddScoped<UseCases.UsuarioRoles.Commands.CreateUsuarioRolCommandHandler>();
        services.AddScoped<UseCases.UsuarioRoles.Commands.UpdateUsuarioRolCommandHandler>();
        services.AddScoped<UseCases.UsuarioRoles.Queries.GetUsuarioRolesQueryHandler>();

        // Paises
        services.AddScoped<UseCases.Paises.Commands.CreatePaisCommandHandler>();
        services.AddScoped<UseCases.Paises.Commands.UpdatePaisCommandHandler>();
        services.AddScoped<UseCases.Paises.Queries.GetPaisesQueryHandler>();

        // Ciudades
        services.AddScoped<UseCases.Ciudades.Commands.CreateCiudadCommandHandler>();
        services.AddScoped<UseCases.Ciudades.Commands.UpdateCiudadCommandHandler>();
        services.AddScoped<UseCases.Ciudades.Queries.GetCiudadesQueryHandler>();

        // TiposDocumento
        services.AddScoped<UseCases.TiposDocumento.Commands.CreateTipoDocumentoCommandHandler>();
        services.AddScoped<UseCases.TiposDocumento.Commands.UpdateTipoDocumentoCommandHandler>();
        services.AddScoped<UseCases.TiposDocumento.Queries.GetTiposDocumentoQueryHandler>();

        // Aeropuertos
        services.AddScoped<UseCases.Aeropuertos.Commands.CreateAeropuertoCommandHandler>();
        services.AddScoped<UseCases.Aeropuertos.Commands.UpdateAeropuertoCommandHandler>();
        services.AddScoped<UseCases.Aeropuertos.Queries.GetAeropuertosQueryHandler>();

        // Aerolineas
        services.AddScoped<UseCases.Aerolineas.Commands.CreateAerolineaCommandHandler>();
        services.AddScoped<UseCases.Aerolineas.Commands.UpdateAerolineaCommandHandler>();
        services.AddScoped<UseCases.Aerolineas.Queries.GetAerolineasQueryHandler>();

        // Terminales
        services.AddScoped<UseCases.Terminales.Commands.CreateTerminalCommandHandler>();
        services.AddScoped<UseCases.Terminales.Commands.UpdateTerminalCommandHandler>();
        services.AddScoped<UseCases.Terminales.Queries.GetTerminalesQueryHandler>();

        // PuertasEmbarque
        services.AddScoped<UseCases.PuertasEmbarque.Commands.CreatePuertaEmbarqueCommandHandler>();
        services.AddScoped<UseCases.PuertasEmbarque.Commands.UpdatePuertaEmbarqueCommandHandler>();
        services.AddScoped<UseCases.PuertasEmbarque.Queries.GetPuertasEmbarqueQueryHandler>();

        // ModelosAvion
        services.AddScoped<UseCases.ModelosAvion.Commands.CreateModeloAvionCommandHandler>();
        services.AddScoped<UseCases.ModelosAvion.Commands.UpdateModeloAvionCommandHandler>();
        services.AddScoped<UseCases.ModelosAvion.Queries.GetModelosAvionQueryHandler>();

        // Aviones
        services.AddScoped<UseCases.Aviones.Commands.CreateAvionCommandHandler>();
        services.AddScoped<UseCases.Aviones.Commands.UpdateAvionCommandHandler>();
        services.AddScoped<UseCases.Aviones.Queries.GetAvionesQueryHandler>();

        // ClasesAsiento
        services.AddScoped<UseCases.ClasesAsiento.Commands.CreateClaseAsientoCommandHandler>();
        services.AddScoped<UseCases.ClasesAsiento.Commands.UpdateClaseAsientoCommandHandler>();
        services.AddScoped<UseCases.ClasesAsiento.Queries.GetClasesAsientoQueryHandler>();

        // Asientos
        services.AddScoped<UseCases.Asientos.Commands.CreateAsientoCommandHandler>();
        services.AddScoped<UseCases.Asientos.Commands.UpdateAsientoCommandHandler>();
        services.AddScoped<UseCases.Asientos.Queries.GetAsientosQueryHandler>();

        // Rutas
        services.AddScoped<UseCases.Rutas.Commands.CreateRutaCommandHandler>();
        services.AddScoped<UseCases.Rutas.Commands.UpdateRutaCommandHandler>();
        services.AddScoped<UseCases.Rutas.Queries.GetRutasQueryHandler>();

        // Vuelos
        services.AddScoped<UseCases.Vuelos.Commands.CreateVueloCommandHandler>();
        services.AddScoped<UseCases.Vuelos.Commands.UpdateVueloCommandHandler>();
        services.AddScoped<UseCases.Vuelos.Queries.GetVuelosQueryHandler>();

        // AsientosVuelo
        services.AddScoped<UseCases.AsientosVuelo.Commands.CreateAsientoVueloCommandHandler>();
        services.AddScoped<UseCases.AsientosVuelo.Commands.UpdateAsientoVueloCommandHandler>();
        services.AddScoped<UseCases.AsientosVuelo.Queries.GetAsientosVueloQueryHandler>();

        // Pasajeros
        services.AddScoped<UseCases.Pasajeros.Commands.CreatePasajeroCommandHandler>();
        services.AddScoped<UseCases.Pasajeros.Commands.UpdatePasajeroCommandHandler>();
        services.AddScoped<UseCases.Pasajeros.Queries.GetPasajerosQueryHandler>();

        // Reservas
        services.AddScoped<UseCases.Reservas.Commands.CreateReservaCommandHandler>();
        services.AddScoped<UseCases.Reservas.Commands.UpdateReservaCommandHandler>();
        services.AddScoped<UseCases.Reservas.Queries.GetReservasQueryHandler>();

        // DetallesReserva
        services.AddScoped<UseCases.DetallesReserva.Commands.CreateDetalleReservaCommandHandler>();
        services.AddScoped<UseCases.DetallesReserva.Commands.UpdateDetalleReservaCommandHandler>();
        services.AddScoped<UseCases.DetallesReserva.Queries.GetDetallesReservaQueryHandler>();

        // Servicios de Reglas de Dominio (Aeromanager.Domain.Services)
        services.AddScoped<Aeromanager.Domain.Services.RutaDomainService>();
        services.AddScoped<Aeromanager.Domain.Services.VueloDomainService>();
        services.AddScoped<Aeromanager.Domain.Services.ReservaDomainService>();

        // Auth, Reportes Excel e Inteligencia Artificial
        services.AddScoped<UseCases.Auth.Commands.LoginCommandHandler>();
        services.AddScoped<UseCases.Reportes.Queries.GenerarReportesExcelQueryHandler>();
        services.AddScoped<UseCases.AiAssistant.Commands.AskAiAssistantCommandHandler>();

        return services;
    }
}