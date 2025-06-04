#!/bin/bash

set -e

APP_NAME="money-tracker-app"
REPO_DIR="$HOME/webapps/money-tracker"

cd "$REPO_DIR"

echo "Stopping and removing existing container (if running)..."
if [ "$(docker ps -q -f name=$APP_NAME)" ]; then
    docker stop $APP_NAME
    docker rm $APP_NAME
fi

echo "Pulling latest code from git..."
git pull

echo "Building and starting with docker-compose..."
docker-compose up --build -d

echo "Deployment complete!"