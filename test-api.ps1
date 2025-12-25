# Test Email API
Write-Host "Testing Email API..." -ForegroundColor Cyan
$emailBody = @{
    type = "welcome"
    to = "lcloon@roadrunner.com"
    data = @{
        userName = "Test User"
    }
} | ConvertTo-Json

try {
    $emailResult = Invoke-RestMethod -Uri "http://localhost:3000/api/send-email" -Method Post -ContentType "application/json" -Body $emailBody
    Write-Host "Email API Response:" -ForegroundColor Green
    $emailResult | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Email API Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Testing Stripe Checkout API..." -ForegroundColor Cyan
$checkoutBody = @{
    priceId = "price_1ShALU8WMeXEKMhbscZyFQb4"
    billingPeriod = "monthly"
    plan = "pro"
} | ConvertTo-Json

try {
    $checkoutResult = Invoke-RestMethod -Uri "http://localhost:3000/api/checkout" -Method Post -ContentType "application/json" -Body $checkoutBody
    Write-Host "Stripe Checkout Response:" -ForegroundColor Green
    $checkoutResult | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Stripe Checkout Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Tests completed!" -ForegroundColor Cyan
