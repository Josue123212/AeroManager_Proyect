using Aeromanager.Application;
using Aeromanager.Infrastructure;
using Aeromanager.Api.Middlewares;

var builder = WebApplication.CreateBuilder(args);

// Registrar controladores
builder.Services.AddControllers();

// Registrar las capas del proyecto
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Configurar OpenAPI
builder.Services.AddOpenApi();
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

// Configurar Swagger
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUi(options =>
    {
        options.DocumentPath = "/openapi/v1.json";
    });
}

// Configurar peticiones HTTP
app.UseHttpsRedirection();

// Habilitar CORS
app.UseCors("AllowFrontend");

// Autenticación JWT y autorización
app.UseMiddleware<JwtAuthMiddleware>();
app.UseAuthorization();

// Mapear controladores
app.MapControllers();

app.Run();