terraform {
  required_version = ">= 1.0.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  description = "Your GCP project ID"
  type        = string
}

variable "region" {
  description = "The region to deploy resources"
  type        = string
  default     = "us-central1"
}

variable "firebase_site_id" {
  description = "firebase site id"
  type        = string
}

variable "cloud_run_service_name" {
  description = "cloud run service name"
  type        = string
}

variable "pubsub_topic_name" {
  description = "pubsub topic name"
  type        = string
}

variable "pubsub_subscription_name" {
  description = "pubsub subscription name"
  type        = string
}

# ---------------------------
# Google Cloud Storage Bucket for Static Website Hosting
# ---------------------------

resource "google_storage_bucket" "static_site" {
  name          = "static-site-${var.project_id}"
  location      = var.region   # Correct this line
  storage_class = "STANDARD"
  force_destroy = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

resource "google_storage_bucket_iam_member" "public_access" {
  bucket = google_storage_bucket.static_site.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

output "static_site_url" {
  value       = "http://${google_storage_bucket.static_site.name}.storage.googleapis.com"
  description = "Public URL for the static site"
}


# ---------------------------
# Cloud Run Service for Express Backend
# ---------------------------
# Build and push the Docker image to Google Container Registry
#
# docker build -t gcr.io/hip-apricot-429910-e1/express-backend:latest
# docker push gcr.io/hip-apricot-429910-e1/express-backend:latest
# ---------------------------
/* 
resource "google_cloud_run_service" "api_service" {
  name     = "express-backend"
  location = var.region

  template {
    spec {
      containers {
        # hardcoded placeholder image, replace with your own when ready
        image=""
        #image = "gcr.io/${var.project_id}/express-backend:latest"
        ports {
          container_port = 8080
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
} 
*/

# resource "google_cloud_run_service" "api_service" {
#   name     = "express-backend"
#   location = var.region

#   template {
#     spec {
#       containers {
#         image   = "node:alpine"
#         command = ["node", "-e"]
#         args = [
#           "const http = require('http'); http.createServer((req, res) => { res.end('Hello, world!'); }).listen(8080);"
#         ]
#         ports {
#           container_port = 8080
#         }
#       }
#     }
#   }

#   traffic {
#     percent         = 100
#     latest_revision = true
#   }
# }

# ---------------------------
# Pub/Sub Topic and Subscription
# ---------------------------
resource "google_pubsub_topic" "my_topic" {
  name = "my-topic"
}

resource "google_pubsub_subscription" "my_subscription" {
  name  = "my-subscription"
  topic = google_pubsub_topic.my_topic.name
}

# ---------------------------
# Outputs
# ---------------------------
output "static_site_endpoint" {
  # The website endpoint follows the pattern: http://<bucket-name>.storage.googleapis.com
  value       = "http://${google_storage_bucket.static_site.name}.storage.googleapis.com"
  description = "Endpoint for static website hosting"
}

# output "cloud_run_url" {
#   value       = google_cloud_run_service.api_service.status[0].url
#   description = "URL of the Cloud Run service"
# }

output "pubsub_topic" {
  value       = google_pubsub_topic.my_topic.name
  description = "Pub/Sub topic name"
}
