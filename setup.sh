#!/bin/bash
# Setup script for StackIt Q&A Platform

echo "🚀 Setting up StackIt Q&A Platform..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Create database and apply schema
echo "🗄️ Creating database..."
npx prisma db push

# Seed the database
echo "🌱 Seeding database with sample data..."
npm run db:seed

# Start development server
echo "🎉 Starting development server..."
npm run dev
