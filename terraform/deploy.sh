#!/bin/bash
# hardcoded file for deployment of changes in frontend to existing bucket

set -e
# Step 1: Build the React app
echo "Cloning repository..."
git pull 
echo "Building React app..."
cd /home/samuosayi/ai-question-app/frontend
npm install
npm run build
cp ./build/index.html ./build/home.html

BUCKET_URL="http://static-site-hip-apricot-429910-e1.storage.googleapis.com"

# Remove the protocol prefix and the storage.googleapis.com suffix to get the bucket name
BUCKET_NAME=$(echo "$BUCKET_URL" | sed -e 's|http://||' -e 's|\.storage\.googleapis\.com||')
echo "Bucket detected: $BUCKET_NAME"

# Step 4: Sync the built static files to the bucket
echo "Deploying static files to gs://$BUCKET_NAME ..."
gsutil -m rsync -R ../frontend/build gs://"$BUCKET_NAME"

echo "Deployment complete! Your static site is available at:"
echo "$BUCKET_URL"