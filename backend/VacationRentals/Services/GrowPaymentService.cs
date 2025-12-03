using System.Text.Json;
using VacationRentals.DTOs;

namespace VacationRentals.Services;

public interface IGrowPaymentService
{
    Task<PaymentResponseDto> CreatePaymentAsync(int apartmentId, int userId, decimal amount, string description);
    Task<bool> VerifyPaymentAsync(string transactionId);
}

public class GrowPaymentService : IGrowPaymentService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<GrowPaymentService> _logger;

    public GrowPaymentService(IConfiguration configuration, HttpClient httpClient, ILogger<GrowPaymentService> logger)
    {
        _configuration = configuration;
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<PaymentResponseDto> CreatePaymentAsync(int apartmentId, int userId, decimal amount, string description)
    {
        var growApiKey = _configuration["Grow:ApiKey"];
        var growTerminalId = _configuration["Grow:TerminalId"];
        var baseUrl = _configuration["Grow:BaseUrl"] ?? "https://api.grow.co.il";
        var callbackUrl = _configuration["Grow:CallbackUrl"];

        if (string.IsNullOrEmpty(growApiKey) || string.IsNullOrEmpty(growTerminalId))
        {
            _logger.LogWarning("Grow payment service not configured");
            return new PaymentResponseDto
            {
                Success = false,
                ErrorMessage = "Payment service not configured"
            };
        }

        try
        {
            var transactionId = Guid.NewGuid().ToString();
            
            var paymentData = new
            {
                terminalId = growTerminalId,
                amount = amount,
                currency = "ILS",
                description = description,
                transactionId = transactionId,
                callbackUrl = $"{callbackUrl}?apartmentId={apartmentId}",
                metadata = new
                {
                    apartmentId = apartmentId,
                    userId = userId
                }
            };

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {growApiKey}");

            var response = await _httpClient.PostAsJsonAsync($"{baseUrl}/api/v1/payments", paymentData);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<GrowPaymentResponse>();
                return new PaymentResponseDto
                {
                    Success = true,
                    PaymentUrl = result?.PaymentUrl,
                    TransactionId = transactionId
                };
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("Grow payment failed: {Error}", errorContent);
                return new PaymentResponseDto
                {
                    Success = false,
                    ErrorMessage = "Payment creation failed"
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating payment");
            return new PaymentResponseDto
            {
                Success = false,
                ErrorMessage = "Payment service error"
            };
        }
    }

    public async Task<bool> VerifyPaymentAsync(string transactionId)
    {
        var growApiKey = _configuration["Grow:ApiKey"];
        var baseUrl = _configuration["Grow:BaseUrl"] ?? "https://api.grow.co.il";

        if (string.IsNullOrEmpty(growApiKey))
        {
            return false;
        }

        try
        {
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {growApiKey}");

            var response = await _httpClient.GetAsync($"{baseUrl}/api/v1/payments/{transactionId}");
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<GrowPaymentStatusResponse>();
                return result?.Status == "completed";
            }
            
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying payment");
            return false;
        }
    }

    private class GrowPaymentResponse
    {
        public string? PaymentUrl { get; set; }
        public string? TransactionId { get; set; }
    }

    private class GrowPaymentStatusResponse
    {
        public string? Status { get; set; }
        public string? TransactionId { get; set; }
    }
}
