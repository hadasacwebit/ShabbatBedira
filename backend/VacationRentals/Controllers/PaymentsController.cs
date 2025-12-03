using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VacationRentals.Data;
using VacationRentals.DTOs;
using VacationRentals.Services;

namespace VacationRentals.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IGrowPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;
    private readonly IConfiguration _configuration;

    private const decimal LISTING_PRICE = 10.00m;

    public PaymentsController(
        ApplicationDbContext context,
        IGrowPaymentService paymentService,
        ILogger<PaymentsController> logger,
        IConfiguration configuration)
    {
        _context = context;
        _paymentService = paymentService;
        _logger = logger;
        _configuration = configuration;
    }

    [Authorize]
    [HttpPost("create")]
    public async Task<ActionResult<PaymentResponseDto>> CreatePayment([FromBody] PaymentRequestDto dto)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var apartment = await _context.Apartments.FindAsync(dto.ApartmentId);
        if (apartment == null)
        {
            return NotFound(new { message = "Apartment not found" });
        }

        if (apartment.UserId != userId)
        {
            return Forbid();
        }

        if (apartment.IsPaid)
        {
            return BadRequest(new { message = "Apartment listing already paid" });
        }

        var response = await _paymentService.CreatePaymentAsync(
            apartment.Id,
            userId.Value,
            LISTING_PRICE,
            $"רישום דירת נופש - {apartment.Title}"
        );

        if (response.Success && !string.IsNullOrEmpty(response.TransactionId))
        {
            apartment.PaymentTransactionId = response.TransactionId;
            await _context.SaveChangesAsync();
        }

        return Ok(response);
    }

    [HttpPost("callback")]
    public async Task<ActionResult> PaymentCallback([FromBody] GrowPaymentCallbackDto dto)
    {
        _logger.LogInformation("Payment callback received: {TransactionId}, Status: {Status}", dto.TransactionId, dto.Status);

        var apartment = await _context.Apartments
            .FirstOrDefaultAsync(a => a.PaymentTransactionId == dto.TransactionId);

        if (apartment == null)
        {
            _logger.LogWarning("Apartment not found for transaction: {TransactionId}", dto.TransactionId);
            return NotFound();
        }

        if (dto.Status == "completed" || dto.Status == "success")
        {
            apartment.IsPaid = true;
            apartment.IsActive = true;
            await _context.SaveChangesAsync();
            _logger.LogInformation("Payment completed for apartment: {ApartmentId}", apartment.Id);
        }

        return Ok();
    }

    [Authorize]
    [HttpPost("verify/{transactionId}")]
    public async Task<ActionResult> VerifyPayment(string transactionId)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var apartment = await _context.Apartments
            .FirstOrDefaultAsync(a => a.PaymentTransactionId == transactionId && a.UserId == userId);

        if (apartment == null)
        {
            return NotFound();
        }

        var isValid = await _paymentService.VerifyPaymentAsync(transactionId);

        if (isValid)
        {
            apartment.IsPaid = true;
            apartment.IsActive = true;
            await _context.SaveChangesAsync();
            return Ok(new { success = true, message = "Payment verified" });
        }

        return BadRequest(new { success = false, message = "Payment not verified" });
    }

    [Authorize]
    [HttpPost("simulate-payment/{apartmentId}")]
    public async Task<ActionResult> SimulatePayment(int apartmentId)
    {
        // Development only - simulate successful payment
        if (!_configuration.GetValue<bool>("AllowPaymentSimulation"))
        {
            return NotFound();
        }

        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var apartment = await _context.Apartments.FindAsync(apartmentId);
        if (apartment == null || apartment.UserId != userId)
        {
            return NotFound();
        }

        apartment.IsPaid = true;
        apartment.IsActive = true;
        apartment.PaymentTransactionId = $"SIM-{Guid.NewGuid()}";
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Payment simulated" });
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
