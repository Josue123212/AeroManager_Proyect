using System;
using System.Collections.Generic;
using Aeromanager.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Aeromanager.Infrastructure.Persistence;

public partial class AeroManagerDbContext : DbContext
{
    public AeroManagerDbContext(DbContextOptions<AeroManagerDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Aerolinea> Aerolinea { get; set; }

    public virtual DbSet<Aeropuerto> Aeropuerto { get; set; }

    public virtual DbSet<Asiento> Asiento { get; set; }

    public virtual DbSet<AsientoVuelo> AsientoVuelo { get; set; }

    public virtual DbSet<Avion> Avion { get; set; }

    public virtual DbSet<Ciudad> Ciudad { get; set; }

    public virtual DbSet<ClaseAsiento> ClaseAsiento { get; set; }

    public virtual DbSet<DetalleReserva> DetalleReserva { get; set; }

    public virtual DbSet<ModeloAvion> ModeloAvion { get; set; }

    public virtual DbSet<Pais> Pais { get; set; }

    public virtual DbSet<Pasajero> Pasajero { get; set; }

    public virtual DbSet<PuertaEmbarque> PuertaEmbarque { get; set; }

    public virtual DbSet<Reserva> Reserva { get; set; }

    public virtual DbSet<Rol> Rol { get; set; }

    public virtual DbSet<Ruta> Ruta { get; set; }

    public virtual DbSet<Terminal> Terminal { get; set; }

    public virtual DbSet<TipoDocumento> TipoDocumento { get; set; }

    public virtual DbSet<Usuario> Usuario { get; set; }

    public virtual DbSet<UsuarioRol> UsuarioRol { get; set; }

    public virtual DbSet<Vuelo> Vuelo { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Aerolinea>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Aerolinea_pkey");

            entity.HasIndex(e => e.CodigoIata, "UQ_Aerolinea_CodigoIata").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.CodigoIata).HasMaxLength(3);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.Nombre).HasMaxLength(150);

            entity.HasOne(d => d.PaisOrigen).WithMany(p => p.Aerolinea)
                .HasForeignKey(d => d.PaisOrigenId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Aerolinea_Pais");
        });

        modelBuilder.Entity<Aeropuerto>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Aeropuerto_pkey");

            entity.HasIndex(e => e.CodigoIata, "UQ_Aeropuerto_CodigoIata").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.CodigoIata).HasMaxLength(3);
            entity.Property(e => e.Direccion).HasMaxLength(250);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.Nombre).HasMaxLength(150);

            entity.HasOne(d => d.Ciudad).WithMany(p => p.Aeropuerto)
                .HasForeignKey(d => d.CiudadId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Aeropuerto_Ciudad");
        });

        modelBuilder.Entity<Asiento>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Asiento_pkey");

            entity.HasIndex(e => new { e.Fila, e.Letra, e.AvionId }, "UQ_Asiento_UbicacionFisica").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.Letra).HasMaxLength(2);

            entity.HasOne(d => d.Avion).WithMany(p => p.Asiento)
                .HasForeignKey(d => d.AvionId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Asiento_Avion");

            entity.HasOne(d => d.ClaseAsiento).WithMany(p => p.Asiento)
                .HasForeignKey(d => d.ClaseAsientoId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Asiento_ClaseAsiento");
        });

        modelBuilder.Entity<AsientoVuelo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("AsientoVuelo_pkey");

            entity.HasIndex(e => new { e.VueloId, e.AsientoId }, "UQ_AsientoVuelo_Concurrencia").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.EstadoConcurrencia)
                .HasMaxLength(30)
                .HasDefaultValueSql("'Disponible'::character varying");
            entity.Property(e => e.FechaActualizacion).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Asiento).WithMany(p => p.AsientoVuelo)
                .HasForeignKey(d => d.AsientoId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_AsientoVuelo_Asiento");

            entity.HasOne(d => d.Vuelo).WithMany(p => p.AsientoVuelo)
                .HasForeignKey(d => d.VueloId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_AsientoVuelo_Vuelo");
        });

        modelBuilder.Entity<Avion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Avion_pkey");

            entity.HasIndex(e => e.Matricula, "UQ_Avion_Matricula").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.EstadoOperativo)
                .HasMaxLength(40)
                .HasDefaultValueSql("'Operativo'::character varying");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.Matricula).HasMaxLength(30);

            entity.HasOne(d => d.Aerolinea).WithMany(p => p.Avion)
                .HasForeignKey(d => d.AerolineaId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Avion_Aerolinea");

            entity.HasOne(d => d.ModeloAvion).WithMany(p => p.Avion)
                .HasForeignKey(d => d.ModeloAvionId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Avion_ModeloAvion");
        });

        modelBuilder.Entity<Ciudad>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Ciudad_pkey");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.Nombre).HasMaxLength(100);

            entity.HasOne(d => d.Pais).WithMany(p => p.Ciudad)
                .HasForeignKey(d => d.PaisId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Ciudad_Pais");
        });

        modelBuilder.Entity<ClaseAsiento>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ClaseAsiento_pkey");

            entity.HasIndex(e => e.Nombre, "UQ_ClaseAsiento_Nombre").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.MultiplicadorTarifa)
                .HasPrecision(5, 2)
                .HasDefaultValue(1.00m);
            entity.Property(e => e.Nombre).HasMaxLength(60);
        });

        modelBuilder.Entity<DetalleReserva>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("DetalleReserva_pkey");

            entity.HasIndex(e => e.AsientoVueloId, "UQ_DetalleReserva_AntiSolapamientoAsiento").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.PrecioUnitario).HasPrecision(10, 2);

            entity.HasOne(d => d.AsientoVuelo).WithOne(p => p.DetalleReserva)
                .HasForeignKey<DetalleReserva>(d => d.AsientoVueloId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_DetalleReserva_AsientoVuelo");

            entity.HasOne(d => d.Pasajero).WithMany(p => p.DetalleReserva)
                .HasForeignKey(d => d.PasajeroId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_DetalleReserva_Pasajero");

            entity.HasOne(d => d.Reserva).WithMany(p => p.DetalleReserva)
                .HasForeignKey(d => d.ReservaId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_DetalleReserva_Reserva");
        });

        modelBuilder.Entity<ModeloAvion>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("ModeloAvion_pkey");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Fabricante).HasMaxLength(100);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.NombreModelo).HasMaxLength(100);
        });

        modelBuilder.Entity<Pais>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Pais_pkey");

            entity.HasIndex(e => e.CodigoIso, "UQ_Pais_CodigoIso").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.CodigoIso).HasMaxLength(3);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<Pasajero>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Pasajero_pkey");

            entity.HasIndex(e => new { e.TipoDocumentoId, e.NumeroDocumento }, "UQ_Pasajero_Documento").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Apellidos).HasMaxLength(100);
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.Nombres).HasMaxLength(100);
            entity.Property(e => e.NumeroDocumento).HasMaxLength(30);
            entity.Property(e => e.Telefono).HasMaxLength(30);

            entity.HasOne(d => d.NacionalidadPais).WithMany(p => p.Pasajero)
                .HasForeignKey(d => d.NacionalidadPaisId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Pasajero_Pais");

            entity.HasOne(d => d.TipoDocumento).WithMany(p => p.Pasajero)
                .HasForeignKey(d => d.TipoDocumentoId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Pasajero_TipoDocumento");
        });

        modelBuilder.Entity<PuertaEmbarque>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PuertaEmbarque_pkey");

            entity.HasIndex(e => new { e.TerminalId, e.CodigoGate }, "UQ_PuertaEmbarque_Terminal_Gate").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.CodigoGate).HasMaxLength(20);
            entity.Property(e => e.Estado)
                .HasMaxLength(30)
                .HasDefaultValueSql("'Disponible'::character varying");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Terminal).WithMany(p => p.PuertaEmbarque)
                .HasForeignKey(d => d.TerminalId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_PuertaEmbarque_Terminal");
        });

        modelBuilder.Entity<Reserva>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Reserva_pkey");

            entity.HasIndex(e => e.CodigoTicket, "UQ_Reserva_CodigoTicket").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.CodigoTicket).HasMaxLength(30);
            entity.Property(e => e.EstadoReserva)
                .HasMaxLength(30)
                .HasDefaultValueSql("'Confirmada'::character varying");
            entity.Property(e => e.FechaReserva).HasDefaultValueSql("now()");
            entity.Property(e => e.MontoTotal).HasPrecision(10, 2);

            entity.HasOne(d => d.UsuarioRegistro).WithMany(p => p.Reserva)
                .HasForeignKey(d => d.UsuarioRegistroId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Reserva_Usuario");

            entity.HasOne(d => d.Vuelo).WithMany(p => p.Reserva)
                .HasForeignKey(d => d.VueloId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Reserva_Vuelo");
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Rol_pkey");

            entity.HasIndex(e => e.Nombre, "UQ_Rol_Nombre").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Descripcion).HasMaxLength(250);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.Nombre).HasMaxLength(80);
        });

        modelBuilder.Entity<Ruta>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Ruta_pkey");

            entity.HasIndex(e => e.CodigoRuta, "UQ_Ruta_CodigoRuta").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.CodigoRuta).HasMaxLength(30);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");

            entity.HasOne(d => d.AeropuertoDestino).WithMany(p => p.RutaAeropuertoDestino)
                .HasForeignKey(d => d.AeropuertoDestinoId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Ruta_AeropuertoDestino");

            entity.HasOne(d => d.AeropuertoOrigen).WithMany(p => p.RutaAeropuertoOrigen)
                .HasForeignKey(d => d.AeropuertoOrigenId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Ruta_AeropuertoOrigen");
        });

        modelBuilder.Entity<Terminal>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Terminal_pkey");

            entity.HasIndex(e => new { e.AeropuertoId, e.Codigo }, "UQ_Terminal_Aeropuerto_Codigo").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Codigo).HasMaxLength(30);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.Nombre).HasMaxLength(100);

            entity.HasOne(d => d.Aeropuerto).WithMany(p => p.Terminal)
                .HasForeignKey(d => d.AeropuertoId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Terminal_Aeropuerto");
        });

        modelBuilder.Entity<TipoDocumento>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("TipoDocumento_pkey");

            entity.HasIndex(e => e.Codigo, "UQ_TipoDocumento_Codigo").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Codigo).HasMaxLength(20);
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.LongitudMaxima).HasDefaultValue(20);
            entity.Property(e => e.Nombre).HasMaxLength(80);
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Usuario_pkey");

            entity.HasIndex(e => e.Email, "UQ_Usuario_Email").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.EstadoAcceso)
                .HasMaxLength(30)
                .HasDefaultValueSql("'Activo'::character varying");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.NombreCompleto).HasMaxLength(150);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
        });

        modelBuilder.Entity<UsuarioRol>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("UsuarioRol_pkey");

            entity.HasIndex(e => new { e.UsuarioId, e.RolId }, "UQ_UsuarioRol_Compuesto").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.FechaAsignacion).HasDefaultValueSql("now()");

            entity.HasOne(d => d.Rol).WithMany(p => p.UsuarioRol)
                .HasForeignKey(d => d.RolId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_UsuarioRol_Rol");

            entity.HasOne(d => d.Usuario).WithMany(p => p.UsuarioRol)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_UsuarioRol_Usuario");
        });

        modelBuilder.Entity<Vuelo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("Vuelo_pkey");

            entity.HasIndex(e => new { e.NumeroVuelo, e.FechaHoraSalida }, "UQ_Vuelo_NumeroVuelo_Salida").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Estado)
                .HasMaxLength(30)
                .HasDefaultValueSql("'Programado'::character varying");
            entity.Property(e => e.FechaCreacion).HasDefaultValueSql("now()");
            entity.Property(e => e.NumeroVuelo).HasMaxLength(20);
            entity.Property(e => e.PrecioBase).HasPrecision(10, 2);

            entity.HasOne(d => d.Avion).WithMany(p => p.Vuelo)
                .HasForeignKey(d => d.AvionId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Vuelo_Avion");

            entity.HasOne(d => d.PuertaEmbarque).WithMany(p => p.Vuelo)
                .HasForeignKey(d => d.PuertaEmbarqueId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Vuelo_PuertaEmbarque");

            entity.HasOne(d => d.Ruta).WithMany(p => p.Vuelo)
                .HasForeignKey(d => d.RutaId)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("FK_Vuelo_Ruta");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
