using System.ComponentModel.DataAnnotations;

namespace VacationRentals.DTOs;

public class CreateApartmentDto
{
    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string City { get; set; } = string.Empty;

    [Required]
    [Range(0, double.MaxValue)]
    public decimal PricePerNight { get; set; }

    [Required]
    [Range(1, 50)]
    public int NumberOfBeds { get; set; }

    [Required]
    [Range(1, 20)]
    public int NumberOfRooms { get; set; }

    public string? ImageUrl { get; set; }

    public string? ContactPhone { get; set; }
}

public class UpdateApartmentDto
{
    [MaxLength(200)]
    public string? Title { get; set; }

    public string? Description { get; set; }

    [MaxLength(200)]
    public string? Address { get; set; }

    [MaxLength(100)]
    public string? City { get; set; }

    [Range(0, double.MaxValue)]
    public decimal? PricePerNight { get; set; }

    [Range(1, 50)]
    public int? NumberOfBeds { get; set; }

    [Range(1, 20)]
    public int? NumberOfRooms { get; set; }

    public string? ImageUrl { get; set; }

    public string? ContactPhone { get; set; }

    public bool? IsActive { get; set; }
}

public class ApartmentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public decimal PricePerNight { get; set; }
    public int NumberOfBeds { get; set; }
    public int NumberOfRooms { get; set; }
    public string? ImageUrl { get; set; }
    public string? ContactPhone { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public int UserId { get; set; }
    public string OwnerName { get; set; } = string.Empty;
}

public class ApartmentSearchDto
{
    public string? Query { get; set; }
    public string? City { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? MinBeds { get; set; }
    public int? MaxBeds { get; set; }
    public int? MinRooms { get; set; }
    public int? MaxRooms { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class PagedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
}
