#!/bin/bash

echo "🚀 Pushing Delibs Dashboard to GHCR (with retry)"
echo "================================================="

# Image name
IMAGE_NAME="ghcr.io/abhikaboy/delib-dashboard"

# Login to GHCR
echo ""
echo "🔐 Logging in to GHCR..."
echo "Please enter your GitHub Personal Access Token (PAT) when prompted"
docker login ghcr.io -u abhikaboy || {
    echo "❌ Login failed"
    exit 1
}

echo ""
echo "📦 Building Docker image for linux/amd64..."
docker buildx build --platform linux/amd64 -t ${IMAGE_NAME}:latest --load . || {
    echo "❌ Build failed"
    exit 1
}

echo ""
echo "🏷️  Tagging image..."
docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:master

echo ""
echo "📤 Pushing to GHCR (with retries)..."

# Function to push with retries
push_with_retry() {
    local tag=$1
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "  Attempt $attempt/$max_attempts: Pushing ${IMAGE_NAME}:${tag}..."
        
        if docker push ${IMAGE_NAME}:${tag}; then
            echo "  ✅ Successfully pushed ${IMAGE_NAME}:${tag}"
            return 0
        else
            echo "  ⚠️  Push failed (attempt $attempt/$max_attempts)"
            if [ $attempt -lt $max_attempts ]; then
                echo "  Waiting 5 seconds before retry..."
                sleep 5
            fi
        fi
        
        attempt=$((attempt + 1))
    done
    
    echo "  ❌ Failed to push ${tag} after $max_attempts attempts"
    return 1
}

# Push both tags
if push_with_retry "latest" && push_with_retry "master"; then
    echo ""
    echo "✅ Successfully pushed all tags to GHCR!"
    echo ""
    echo "📦 Available at:"
    echo "  - ${IMAGE_NAME}:latest"
    echo "  - ${IMAGE_NAME}:master"
    echo ""
    echo "🌐 View on GitHub:"
    echo "  https://github.com/abhikaboy/delib-dashboard/pkgs/container/delib-dashboard"
    echo ""
    echo "🚀 Next steps:"
    echo "  1. Go to Digital Ocean App Platform"
    echo "  2. Go to Deployments → Deploy → Force Rebuild"
    echo "  3. Wait for deployment to complete"
    exit 0
else
    echo ""
    echo "❌ Push failed after multiple retries"
    echo ""
    echo "💡 Possible solutions:"
    echo "  1. Check your internet connection"
    echo "  2. Verify your GitHub PAT has 'write:packages' permission"
    echo "  3. Try again in a few minutes (might be a temporary GitHub issue)"
    echo "  4. Use GitHub Actions to build and push instead"
    exit 1
fi
