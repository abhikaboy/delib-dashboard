#!/bin/bash

echo "🚀 Pushing Delibs Dashboard to GHCR"
echo "===================================="

# Check if logged in to GHCR
if ! docker info 2>/dev/null | grep -q "ghcr.io"; then
    echo "⚠️  Not logged in to GHCR"
    echo "Please login first:"
    echo "  docker login ghcr.io -u abhikaboy"
    echo ""
    read -p "Press Enter to login now, or Ctrl+C to cancel..."
    docker login ghcr.io -u abhikaboy
fi

# Image names
IMAGE_NAME="ghcr.io/abhikaboy/delib-dashboard"
TAGS=("latest" "master")

echo ""
echo "📦 Building Docker image for linux/amd64 (App Platform)..."
docker buildx build --platform linux/amd64 -t ${IMAGE_NAME}:latest --load . || {
    echo "❌ Build failed"
    echo ""
    echo "💡 If you see 'buildx' not found, run:"
    echo "   docker buildx create --use"
    exit 1
}

echo ""
echo "🏷️  Tagging images..."
for tag in "${TAGS[@]}"; do
    if [ "$tag" != "latest" ]; then
        docker tag ${IMAGE_NAME}:latest ${IMAGE_NAME}:${tag}
    fi
    echo "  ✅ Tagged as ${IMAGE_NAME}:${tag}"
done

echo ""
echo "📤 Pushing to GHCR..."
for tag in "${TAGS[@]}"; do
    echo "  Pushing ${IMAGE_NAME}:${tag}..."
    docker push ${IMAGE_NAME}:${tag} || {
        echo "  ❌ Failed to push ${tag}"
        exit 1
    }
    echo "  ✅ Pushed ${IMAGE_NAME}:${tag}"
done

echo ""
echo "✅ Successfully pushed to GHCR!"
echo ""
echo "📦 Available at:"
for tag in "${TAGS[@]}"; do
    echo "  - ${IMAGE_NAME}:${tag}"
done
echo ""
echo "🌐 View on GitHub:"
echo "  https://github.com/abhikaboy/delib-dashboard/pkgs/container/delib-dashboard"
