# PowerShell script to start the application in production mode
Write-Host "🚀 Starting Chat Application in Production Mode..." -ForegroundColor Green

# Set environment variable for production
$env:NODE_ENV = "production"

try {
    # Build the application
    Write-Host "📦 Building application..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build completed successfully" -ForegroundColor Green
        
        # Start the server
        Write-Host "🎯 Starting production server..." -ForegroundColor Yellow
        npm run start
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error starting application: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
