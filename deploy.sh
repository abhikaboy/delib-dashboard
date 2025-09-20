#!/bin/bash

echo "🚀 Delibs Deployment Script"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building frontend..."
npm run build

echo "📁 Backend setup..."
cd backend
npm install

echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Deploy backend to Railway/Render/Heroku"
echo "2. Update API_BASE_URL in frontend code with your backend URL"
echo "3. Deploy frontend to Vercel/Netlify"
echo "4. Configure environment variables on both platforms"
echo ""
echo "See DEPLOYMENT.md for detailed instructions."
