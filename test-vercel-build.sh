#!/bin/bash

echo "🧪 Testing Vercel Build Configuration"
echo "====================================="
echo ""

# Set Vercel environment variable
export VERCEL=1

echo "📦 Building with Vercel environment..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build succeeded!"
    echo ""
    echo "📁 Checking output directory..."
    
    if [ -d ".output/public" ]; then
        echo "✅ .output/public exists"
        
        if [ -f ".output/public/index.html" ]; then
            echo "✅ index.html found"
        else
            echo "❌ index.html NOT found"
            exit 1
        fi
        
        if [ -d ".output/public/assets" ]; then
            echo "✅ assets/ folder found"
            echo ""
            echo "📊 Build output:"
            ls -lh .output/public/
            echo ""
            echo "🎉 Ready to deploy to Vercel!"
            echo ""
            echo "Next steps:"
            echo "  1. git add ."
            echo "  2. git commit -m 'Configure for Vercel deployment'"
            echo "  3. git push origin main"
            echo "  4. Vercel will auto-deploy"
        else
            echo "❌ assets/ folder NOT found"
            exit 1
        fi
    else
        echo "❌ .output/public does NOT exist"
        exit 1
    fi
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "Check the error messages above."
    echo "Common issues:"
    echo "  - TypeScript errors"
    echo "  - Missing dependencies"
    echo "  - Import errors"
    exit 1
fi
