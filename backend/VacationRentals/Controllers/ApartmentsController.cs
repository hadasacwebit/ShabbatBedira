using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VacationRentals.Data;
using VacationRentals.DTOs;
using VacationRentals.Models;

namespace VacationRentals.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApartmentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ApartmentsController> _logger;

    public ApartmentsController(ApplicationDbContext context, ILogger<ApartmentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<ApartmentDto>>> GetApartments([FromQuery] ApartmentSearchDto search)
    {
        var query = _context.Apartments
            .Include(a => a.User)
            .Where(a => a.IsActive && a.IsPaid)
            .AsQueryable();

        // Search by query (address or city)
        if (!string.IsNullOrWhiteSpace(search.Query))
        {
            var searchTerm = search.Query.ToLower();
            query = query.Where(a => 
                a.Address.ToLower().Contains(searchTerm) || 
                a.City.ToLower().Contains(searchTerm) ||
                a.Title.ToLower().Contains(searchTerm));
        }

        // Filter by city
        if (!string.IsNullOrWhiteSpace(search.City))
        {
            query = query.Where(a => a.City.ToLower() == search.City.ToLower());
        }

        // Filter by price
        if (search.MinPrice.HasValue)
        {
            query = query.Where(a => a.PricePerNight >= search.MinPrice.Value);
        }
        if (search.MaxPrice.HasValue)
        {
            query = query.Where(a => a.PricePerNight <= search.MaxPrice.Value);
        }

        // Filter by beds
        if (search.MinBeds.HasValue)
        {
            query = query.Where(a => a.NumberOfBeds >= search.MinBeds.Value);
        }
        if (search.MaxBeds.HasValue)
        {
            query = query.Where(a => a.NumberOfBeds <= search.MaxBeds.Value);
        }

        // Filter by rooms
        if (search.MinRooms.HasValue)
        {
            query = query.Where(a => a.NumberOfRooms >= search.MinRooms.Value);
        }
        if (search.MaxRooms.HasValue)
        {
            query = query.Where(a => a.NumberOfRooms <= search.MaxRooms.Value);
        }

        var totalCount = await query.CountAsync();

        var apartments = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((search.Page - 1) * search.PageSize)
            .Take(search.PageSize)
            .Select(a => new ApartmentDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                Address = a.Address,
                City = a.City,
                PricePerNight = a.PricePerNight,
                NumberOfBeds = a.NumberOfBeds,
                NumberOfRooms = a.NumberOfRooms,
                ImageUrl = a.ImageUrl,
                ContactPhone = a.ContactPhone,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                UserId = a.UserId,
                OwnerName = a.User.Name
            })
            .ToListAsync();

        return Ok(new PagedResultDto<ApartmentDto>
        {
            Items = apartments,
            TotalCount = totalCount,
            Page = search.Page,
            PageSize = search.PageSize
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApartmentDto>> GetApartment(int id)
    {
        var apartment = await _context.Apartments
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (apartment == null)
        {
            return NotFound();
        }

        return Ok(new ApartmentDto
        {
            Id = apartment.Id,
            Title = apartment.Title,
            Description = apartment.Description,
            Address = apartment.Address,
            City = apartment.City,
            PricePerNight = apartment.PricePerNight,
            NumberOfBeds = apartment.NumberOfBeds,
            NumberOfRooms = apartment.NumberOfRooms,
            ImageUrl = apartment.ImageUrl,
            ContactPhone = apartment.ContactPhone,
            IsActive = apartment.IsActive,
            CreatedAt = apartment.CreatedAt,
            UserId = apartment.UserId,
            OwnerName = apartment.User.Name
        });
    }

    [HttpGet("cities")]
    public async Task<ActionResult<List<string>>> GetCities()
    {
        var cities = await _context.Apartments
            .Where(a => a.IsActive && a.IsPaid)
            .Select(a => a.City)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(cities);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ApartmentDto>> CreateApartment([FromBody] CreateApartmentDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var apartment = new Apartment
        {
            Title = dto.Title,
            Description = dto.Description,
            Address = dto.Address,
            City = dto.City,
            PricePerNight = dto.PricePerNight,
            NumberOfBeds = dto.NumberOfBeds,
            NumberOfRooms = dto.NumberOfRooms,
            ImageUrl = dto.ImageUrl,
            ContactPhone = dto.ContactPhone,
            UserId = userId.Value,
            IsActive = false,
            IsPaid = false
        };

        _context.Apartments.Add(apartment);
        await _context.SaveChangesAsync();

        var user = await _context.Users.FindAsync(userId);

        return CreatedAtAction(nameof(GetApartment), new { id = apartment.Id }, new ApartmentDto
        {
            Id = apartment.Id,
            Title = apartment.Title,
            Description = apartment.Description,
            Address = apartment.Address,
            City = apartment.City,
            PricePerNight = apartment.PricePerNight,
            NumberOfBeds = apartment.NumberOfBeds,
            NumberOfRooms = apartment.NumberOfRooms,
            ImageUrl = apartment.ImageUrl,
            ContactPhone = apartment.ContactPhone,
            IsActive = apartment.IsActive,
            CreatedAt = apartment.CreatedAt,
            UserId = apartment.UserId,
            OwnerName = user?.Name ?? ""
        });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApartmentDto>> UpdateApartment(int id, [FromBody] UpdateApartmentDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var apartment = await _context.Apartments
            .Include(a => a.User)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (apartment == null)
        {
            return NotFound();
        }

        if (apartment.UserId != userId)
        {
            return Forbid();
        }

        if (dto.Title != null) apartment.Title = dto.Title;
        if (dto.Description != null) apartment.Description = dto.Description;
        if (dto.Address != null) apartment.Address = dto.Address;
        if (dto.City != null) apartment.City = dto.City;
        if (dto.PricePerNight.HasValue) apartment.PricePerNight = dto.PricePerNight.Value;
        if (dto.NumberOfBeds.HasValue) apartment.NumberOfBeds = dto.NumberOfBeds.Value;
        if (dto.NumberOfRooms.HasValue) apartment.NumberOfRooms = dto.NumberOfRooms.Value;
        if (dto.ImageUrl != null) apartment.ImageUrl = dto.ImageUrl;
        if (dto.ContactPhone != null) apartment.ContactPhone = dto.ContactPhone;
        if (dto.IsActive.HasValue) apartment.IsActive = dto.IsActive.Value;
        
        apartment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new ApartmentDto
        {
            Id = apartment.Id,
            Title = apartment.Title,
            Description = apartment.Description,
            Address = apartment.Address,
            City = apartment.City,
            PricePerNight = apartment.PricePerNight,
            NumberOfBeds = apartment.NumberOfBeds,
            NumberOfRooms = apartment.NumberOfRooms,
            ImageUrl = apartment.ImageUrl,
            ContactPhone = apartment.ContactPhone,
            IsActive = apartment.IsActive,
            CreatedAt = apartment.CreatedAt,
            UserId = apartment.UserId,
            OwnerName = apartment.User.Name
        });
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteApartment(int id)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var apartment = await _context.Apartments.FindAsync(id);

        if (apartment == null)
        {
            return NotFound();
        }

        if (apartment.UserId != userId)
        {
            return Forbid();
        }

        _context.Apartments.Remove(apartment);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [Authorize]
    [HttpGet("my")]
    public async Task<ActionResult<List<ApartmentDto>>> GetMyApartments()
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var apartments = await _context.Apartments
            .Include(a => a.User)
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new ApartmentDto
            {
                Id = a.Id,
                Title = a.Title,
                Description = a.Description,
                Address = a.Address,
                City = a.City,
                PricePerNight = a.PricePerNight,
                NumberOfBeds = a.NumberOfBeds,
                NumberOfRooms = a.NumberOfRooms,
                ImageUrl = a.ImageUrl,
                ContactPhone = a.ContactPhone,
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt,
                UserId = a.UserId,
                OwnerName = a.User.Name
            })
            .ToListAsync();

        return Ok(apartments);
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(userIdClaim, out int userId))
        {
            return userId;
        }
        return null;
    }
}
