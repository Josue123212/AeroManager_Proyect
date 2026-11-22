# Etapa 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["Aeromanager.Api/Aeromanager.Api.csproj", "Aeromanager.Api/"]
COPY ["Aeromanager.Application/Aeromanager.Application.csproj", "Aeromanager.Application/"]
COPY ["Aeromanager.Domain/Aeromanager.Domain.csproj", "Aeromanager.Domain/"]
COPY ["Aeromanager.Infrastructure/Aeromanager.Infrastructure.csproj", "Aeromanager.Infrastructure/"]

RUN dotnet restore "Aeromanager.Api/Aeromanager.Api.csproj"

COPY Aeromanager.Api/ Aeromanager.Api/
COPY Aeromanager.Application/ Aeromanager.Application/
COPY Aeromanager.Domain/ Aeromanager.Domain/
COPY Aeromanager.Infrastructure/ Aeromanager.Infrastructure/

WORKDIR /src/Aeromanager.Api
RUN dotnet publish "Aeromanager.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Aeromanager.Api.dll"]
