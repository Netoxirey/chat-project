#!/bin/bash

# Bash script to start the application in production mode
echo "🚀 Starting Chat Application in Production Mode..."

# Set environment variable for production
export NODE_ENV=production

# Build the application
echo "📦 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
    
    # Start the server
    echo "🎯 Starting production server..."
    npm run start
else
    echo "❌ Build failed"
    exit 1
fi
