
using Aeromanager.Application.DTOs;
using Aeromanager.Application.Interfaces;
using Aeromanager.Application.UseCases.Usuarios.Commands;
using Aeromanager.Application.UseCases.Usuarios.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace Aeromanager.Api.Controllers;

[ApiController]
[Route("api/usuarios")]
[Authorize(Roles = "SuperAdmin,Administrador")]
public class UsuariosController(
    GetUsuariosQueryHandler queryHandler,
    CreateUsuarioCommandHandler createHandler,
    UpdateUsuarioCommandHandler updateHandler,
    IPasswordHasher passwordHasher,
    IValidator<CreateUsuarioCommand> createValidator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> GetAll()
    {
        var items = await queryHandler.Handle(new GetUsuariosQuery());
        return Ok(items);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UsuarioDto>> GetById(int id)
    {
        var item = await queryHandler.GetByIdAsync(id);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> Create(
        CreateUsuarioRequest request)
    {
        var hash = passwordHasher.HashPassword(request.Password);
        var command = new CreateUsuarioCommand(request.NombreCompleto, request.Email, hash, request.EstadoAcceso);
        var validation = await createValidator.ValidateAsync(command);
        if (!validation.IsValid)
        {
            foreach (var error in validation.Errors)
            {
                ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
            }

            return ValidationProblem(ModelState);
        }

        var item = await createHandler.Handle(command);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, item);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<UsuarioDto>> Update(
        int id, UpdateUsuarioRequest request)
    {
        var currentUserIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(currentUserIdClaim, out var currentUserId) && currentUserId == id && !request.Activo)
        {
            return BadRequest(new { message = "No puedes desactivar tu propia cuenta en sesión." });
        }

        string? newHash = null;
        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            var cleanPwd = request.Password.Trim();
            if (cleanPwd.Length < 6)
            {
                return BadRequest(new { message = "La nueva contraseña debe tener al menos 6 caracteres." });
            }
            newHash = passwordHasher.HashPassword(cleanPwd);
        }

        var callerIsSuperAdmin = User.IsInRole("SuperAdmin");
        var command = new UpdateUsuarioCommand(
            id,
            request.NombreCompleto,
            request.Email,
            request.EstadoAcceso,
            request.Activo,
            newHash);
        var item = await updateHandler.Handle(command, callerIsSuperAdmin);
        if (item is null)
        {
            return NotFound();
        }

        return Ok(item);
    }

    public record CreateUsuarioRequest(
        [Required] string NombreCompleto,
        [Required] string Email,
        [Required] string Password,
        [Required] string EstadoAcceso = "ACTIVO");

    public record UpdateUsuarioRequest(
        int Id,
        [Required] string NombreCompleto,
        [Required] string Email,
        [Required] string EstadoAcceso,
        bool Activo,
        string? Password = null);
}
