using System.ComponentModel.DataAnnotations;

namespace VacationRentals.DTOs;

public class PaymentRequestDto
{
    [Required]
    public int ApartmentId { get; set; }
}

public class PaymentResponseDto
{
    public bool Success { get; set; }
    public string? PaymentUrl { get; set; }
    public string? TransactionId { get; set; }
    public string? ErrorMessage { get; set; }
}

public class GrowPaymentCallbackDto
{
    public string TransactionId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int ApartmentId { get; set; }
}
