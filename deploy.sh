#!/bin/bash

# Hentikan eksekusi jika terjadi error
set -e

# Path ke direktori proyek di VPS
REPO_PATH="/root/be-sistem-penjurian-jemparingan"

# Docker Hub credentials dari variabel lingkungan
DOCKER_USERNAME=${DOCKER_USERNAME}
DOCKER_PASSWORD=${DOCKER_PASSWORD}
DOCKER_IMAGE="nugrohoarr/bepakualaman"
DOCKER_TAG="v1"

# Pastikan berada di direktori proyek
cd $REPO_PATH

# Pull perubahan terbaru dari repository GitHub
echo "Pulling latest changes from GitHub..."
git pull origin main

# Build Docker image dengan build argument untuk environment variables
echo "Building Docker image..."
docker build --build-arg AT_SECRET=${AT_SECRET} --build-arg RT_SECRET=${RT_SECRET} --build-arg DATABASE_URL=${DATABASE_URL} --build-arg SUPERADMIN_EMAILS=${SUPERADMIN_EMAILS} -t $DOCKER_IMAGE:$DOCKER_TAG .

# Login ke Docker Hub secara non-interaktif
echo "Logging in to Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Push Docker image ke Docker Hub
echo "Pushing Docker image to Docker Hub..."
docker push $DOCKER_IMAGE:$DOCKER_TAG

# Stop dan remove container lama jika ada
echo "Stopping and removing old container if exists..."
docker stop backend || true
docker rm backend || true

# Jalankan Docker container dengan variabel lingkungan dari build argument
echo "Running Docker container..."
docker run -d --name backend -p 8080:8080 -e AT_SECRET=$AT_SECRET -e RT_SECRET=$RT_SECRET -e DATABASE_URL=$DATABASE_URL $DOCKER_IMAGE:$DOCKER_TAG

# Hapus Docker images yang lama
echo "Cleaning up old Docker images..."
docker image prune -a -f

echo "Deployment completed successfully!"
