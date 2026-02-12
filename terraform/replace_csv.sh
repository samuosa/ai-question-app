#!/bin/sh

# Function to display usage and exit
show_usage() {
    echo "please provide bucket name and data.csv file"
    echo "gcloud storage ls"
    exit 1
}

# 1. Check if we have exactly 2 arguments (Bucket Name and File)
if [ "$#" -ne 2 ]; then
    show_usage
fi

BUCKET_NAME=$1
LOCAL_FILE=$2

# 2. Check if the local file actually exists
if [ ! -f "$LOCAL_FILE" ]; then
    echo "Error: File '$LOCAL_FILE' not found."
    show_usage
fi

# 3. If valid, proceed to list and copy
# Strip 'gs://' prefix if the user accidentally included it, to ensure valid URI construction
CLEAN_BUCKET=${BUCKET_NAME#gs://}

echo "Current contents of gs://$CLEAN_BUCKET:"
gcloud storage ls "gs://$CLEAN_BUCKET/"

echo "Uploading $LOCAL_FILE to gs://$CLEAN_BUCKET/data.csv..."
gcloud storage cp "$LOCAL_FILE" "gs://$CLEAN_BUCKET/data.csv"
