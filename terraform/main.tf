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

# ---------------------------
# Google Cloud Storage Bucket for Static Website Hosting
# ---------------------------
resource "google_storage_bucket" "static_site" {
  name          = "static-site-${var.project_id}"
  location      = var.region
  force_destroy = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# ---------------------------
# Cloud Run Service for Express Backend
# ---------------------------
resource "google_cloud_run_service" "api_service" {
  name     = "express-backend"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/express-backend:latest"
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

output "cloud_run_url" {
  value       = google_cloud_run_service.api_service.status[0].url
  description = "URL of the Cloud Run service"
}

output "pubsub_topic" {
  value       = google_pubsub_topic.my_topic.name
  description = "Pub/Sub topic name"
}
