using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VacationRentals.Models;

public class Apartment
{
    [Key]
    public int Id { get; set; }

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
    [Column(TypeName = "decimal(10,2)")]
    public decimal PricePerNight { get; set; }

    [Required]
    [Range(1, 50)]
    public int NumberOfBeds { get; set; }

    [Required]
    [Range(1, 20)]
    public int NumberOfRooms { get; set; }

    public string? ImageUrl { get; set; }

    public string? ContactPhone { get; set; }

    public bool IsActive { get; set; } = true;

    public bool IsPaid { get; set; } = false;

    public string? PaymentTransactionId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    [Required]
    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
