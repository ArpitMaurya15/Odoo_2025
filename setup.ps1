# Setup script for StackIt Q&A Platform

Write-Host "🚀 Setting up StackIt Q&A Platform..." -ForegroundColor Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# Create database and apply schema
Write-Host "🗄️ Creating database..." -ForegroundColor Yellow
npx prisma db push

# Seed the database
Write-Host "🌱 Seeding database with sample data..." -ForegroundColor Yellow
npm run db:seed

Write-Host "✅ Setup complete! You can now run 'npm run dev' to start the server." -ForegroundColor Green
