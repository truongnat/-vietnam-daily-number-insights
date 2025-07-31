# Test script để kiểm tra timeout fix
Write-Host "🚀 Testing Timeout Fix for Cron APIs" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$baseUrl = "http://localhost:3000"

# Test 1: Daily Analysis API
Write-Host "`n📊 Test 1: Daily Analysis API" -ForegroundColor Yellow
$start = Get-Date
$response = Invoke-WebRequest -Uri "$baseUrl/api/cron/daily-analysis" -UseBasicParsing
$end = Get-Date
$duration = ($end - $start).TotalMilliseconds

Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "⏱️  Response Time: $([math]::Round($duration, 2))ms" -ForegroundColor Cyan

$content = $response.Content | ConvertFrom-Json
Write-Host "📝 Message: $($content.message)" -ForegroundColor White
Write-Host "🔄 Status: $($content.status)" -ForegroundColor White

# Test 2: Lottery Check API
Write-Host "`n🎰 Test 2: Lottery Check API" -ForegroundColor Yellow
$start = Get-Date
$response = Invoke-WebRequest -Uri "$baseUrl/api/cron/lottery-check" -UseBasicParsing
$end = Get-Date
$duration = ($end - $start).TotalMilliseconds

Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "⏱️  Response Time: $([math]::Round($duration, 2))ms" -ForegroundColor Cyan

$content = $response.Content | ConvertFrom-Json
Write-Host "📝 Message: $($content.message)" -ForegroundColor White

# Test 3: Status API
Write-Host "`n📈 Test 3: Status API" -ForegroundColor Yellow
$start = Get-Date
$response = Invoke-WebRequest -Uri "$baseUrl/api/cron/status" -UseBasicParsing
$end = Get-Date
$duration = ($end - $start).TotalMilliseconds

Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
Write-Host "⏱️  Response Time: $([math]::Round($duration, 2))ms" -ForegroundColor Cyan

$content = $response.Content | ConvertFrom-Json
Write-Host "📅 Date Key: $($content.dateKey)" -ForegroundColor White
Write-Host "🕐 Current Time: $($content.currentTime)" -ForegroundColor White
Write-Host "📊 Analysis Status: $($content.processing.analysis.status)" -ForegroundColor White
Write-Host "🎰 Lottery Status: $($content.processing.lottery.status)" -ForegroundColor White

Write-Host "`n🎯 Summary:" -ForegroundColor Green
Write-Host "- All APIs should respond in < 1000ms (1 second)" -ForegroundColor White
Write-Host "- Background processing runs separately" -ForegroundColor White
Write-Host "- No more 30s timeout issues with cron-job.org!" -ForegroundColor White
Write-Host "- Use /api/cron/status to monitor background progress" -ForegroundColor White
