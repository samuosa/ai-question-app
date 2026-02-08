#!/bin/bash
set -e

# This script builds the React app and deploys the static files to the Cloud Storage bucket.
# It assumes that Terraform has already been applied and that the output "static_site_url"
# is defined in the Terraform configuration in the form:
#   "http://<bucket-name>.storage.googleapis.com"

# Save the current directory (terraform folder)
TERRAFORM_DIR=$(pwd)

# Step 1: Build the React app
echo "Building React app..."
cd ../frontend
npm install
npm run build
cp ./build/index.html ./build/home.html

# Step 2: Return to terraform directory
cd "$TERRAFORM_DIR"

# Step 3: Extract the bucket name from Terraform output
echo "Extracting bucket name from Terraform output..."
# The Terraform output should be like: "http://static-site-<project-id>.storage.googleapis.com"
BUCKET_URL=$(terraform output -raw static_site_url)
if [ -z "$BUCKET_URL" ]; then
  echo "Error: static_site_url output not found. Please run 'terraform apply' first."
  BUCKET_URL="http://static-site-hip-apricot-429910-e1.storage.googleapis.com"
  # exit 1
fi

# Remove the protocol prefix and the storage.googleapis.com suffix to get the bucket name
BUCKET_NAME=$(echo "$BUCKET_URL" | sed -e 's|http://||' -e 's|\.storage\.googleapis\.com||')
echo "Bucket detected: $BUCKET_NAME"

# Step 4: Sync the built static files to the bucket
echo "Deploying static files to gs://$BUCKET_NAME ..."
gsutil -m rsync -R ../frontend/build gs://"$BUCKET_NAME"

echo "Deployment complete! Your static site is available at:"
echo "$BUCKET_URL"
