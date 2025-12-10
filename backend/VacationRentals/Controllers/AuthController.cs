using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VacationRentals.Data;
using VacationRentals.DTOs;
using VacationRentals.Models;
using VacationRentals.Services;

namespace VacationRentals.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IGoogleAuthService _googleAuthService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ApplicationDbContext context,
        IJwtService jwtService,
        IGoogleAuthService googleAuthService,
        ILogger<AuthController> logger)
    {
        _context = context;
        _jwtService = jwtService;
        _googleAuthService = googleAuthService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest(new { message = "Email already registered" });
        }

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            }
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            }
        });
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponseDto>> GoogleLogin([FromBody] GoogleLoginDto dto)
    {
        var googleUser = await _googleAuthService.VerifyGoogleTokenAsync(dto.IdToken);

        if (googleUser == null)
        {
            return Unauthorized(new { message = "Invalid Google token" });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleUser.GoogleId);

        if (user == null)
        {
            user = await _context.Users.FirstOrDefaultAsync(u => u.Email == googleUser.Email);
            
            if (user != null)
            {
                user.GoogleId = googleUser.GoogleId;
            }
            else
            {
                user = new User
                {
                    Name = googleUser.Name,
                    Email = googleUser.Email,
                    GoogleId = googleUser.GoogleId
                };
                _context.Users.Add(user);
            }
            
            await _context.SaveChangesAsync();
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email
            }
        });
    }
}
