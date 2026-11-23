using Aeromanager.Application;
using Aeromanager.Infrastructure;
using Aeromanager.Api.Middlewares;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Registrar controladores
builder.Services.AddControllers();

// Registrar las capas del proyecto
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHostedService<Aeromanager.Api.Services.FlightStatusHostedService>();

// Configurar OpenAPI
builder.Services.AddOpenApi();
builder.Services
    .AddAuthentication("Bearer")
    .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, BearerAuthenticationHandler>("Bearer", null);
builder.Services.AddAuthorization();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Registrar los dos middlewares nuevos
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configurar Swagger (habilitado también en Producción para Render)
app.MapOpenApi();
app.UseSwaggerUi(options =>
{
    options.DocumentPath = "/openapi/v1.json";
});

app.MapGet("/", () => Results.Redirect("/swagger"));

// Configurar peticiones HTTP (Render gestiona HTTPS en su proxy inverso)
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Habilitar CORS
app.UseCors("AllowFrontend");

// Autenticación JWT y autorización
app.UseAuthentication();
app.UseAuthorization();

// Mapear controladores
app.MapControllers();

app.Run();