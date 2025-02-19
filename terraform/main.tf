# --------------------------------------------------------------------------------
# Basic Terraform script to set up:
#   1) Firebase Hosting for a React App
#   2) Cloud Run for an Express backend
#   3) Pub/Sub for messaging
#
# Replace "your-gcp-project-id" where appropriate.
# --------------------------------------------------------------------------------

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  # Project & region can be overridden by environment variables or by specifying them below.
  project = var.project_id
  region  = var.region
}

################################################################################
# Variables
################################################################################
variable "project_id" {
  type        = string
  description = "The GCP project ID where resources will be created"
}

variable "region" {
  type        = string
  description = "The region to deploy resources"
  default     = "us-central1"
}

variable "firebase_site_id" {
  type        = string
  description = "Site ID for Firebase Hosting"
  default     = "my-react-app"
}

variable "cloud_run_service_name" {
  type        = string
  description = "Name for the Cloud Run service"
  default     = "smart-home-backend"
}

variable "pubsub_topic_name" {
  type        = string
  description = "Name for the Pub/Sub topic"
  default     = "smart-home-events"
}

variable "pubsub_subscription_name" {
  type        = string
  description = "Name for the Pub/Sub subscription"
  default     = "smart-home-sub"
}

################################################################################
# Firebase Hosting Setup (Site creation)
################################################################################
resource "google_firebase_hosting_site" "frontend" {
  project = var.project_id
  site_id = var.firebase_site_id
}

################################################################################
# Cloud Run (Express Backend)
################################################################################
resource "google_cloud_run_service" "backend" {
  name     = var.cloud_run_service_name
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/${var.cloud_run_service_name}:latest"
        ports {
          container_port = 8080
        }
      }
    }
  }

  # Allow public (unauthenticated) access.
  autogenerate_revision_name = true
}

# Enable public access to the Cloud Run service
resource "google_cloud_run_service_iam_member" "noauth" {
  location       = google_cloud_run_service.backend.location
  project        = var.project_id
  service        = google_cloud_run_service.backend.name
  role           = "roles/run.invoker"
  member         = "allUsers"
}

################################################################################
# Pub/Sub Topic & Subscription
################################################################################
resource "google_pubsub_topic" "smart_home" {
  name = var.pubsub_topic_name
}

resource "google_pubsub_subscription" "smart_home_subscription" {
  name  = var.pubsub_subscription_name
  topic = google_pubsub_topic.smart_home.name
}

################################################################################
# Outputs
################################################################################
output "firebase_site_id" {
  description = "Site ID for Firebase Hosting"
  value       = google_firebase_hosting_site.frontend.site_id
}

output "cloud_run_url" {
  description = "Cloud Run URL for the Express Backend"
  value       = google_cloud_run_service.backend.status[0].url
}

output "pubsub_topic" {
  description = "Pub/Sub topic name"
  value       = google_pubsub_topic.smart_home.name
}

output "pubsub_subscription" {
  description = "Pub/Sub subscription name"
  value       = google_pubsub_subscription.smart_home_subscription.name
}
