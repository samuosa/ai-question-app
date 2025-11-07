# GCP Infrastructure Deployment with Terraform

This repository contains a Terraform configuration that automates the setup of the following resources on Google Cloud Platform:

- **Google Cloud Storage Bucket** configured for static website hosting (to serve your React app).
- **Cloud Run Service** to host your Express backend.
- **Pub/Sub Topic and Subscription** for messaging.

> **Note:** This configuration is designed to stay within the GCP Free Tier. Ensure you follow the instructions below for the necessary manual setup steps.

---

## Prerequisites

- **Terraform:** [Install Terraform](https://www.terraform.io/downloads.html)
- **Google Cloud Account:** Ensure you have an active GCP account with billing enabled.
- **gcloud CLI:** [Install the Google Cloud SDK](https://cloud.google.com/sdk/docs/install) and authenticate (`gcloud auth login`).
- **Service Account Credentials:** A service account with permissions to manage Cloud Storage, Cloud Run, and Pub/Sub resources. Set the environment variable:

  ```bash
  export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account-key.json"
  ```

---

## Enabling Necessary GCP APIs

Before applying the Terraform configuration, enable the following APIs:

1. **Cloud Storage API**
2. **Cloud Run API**
3. **Pub/Sub API**
4. **Cloud Build API** (required if you plan to build and push container images)
5. **Artifact Registry API** (if you use it for container storage)

You can enable these APIs via the GCP Console or run:

```bash
gcloud services enable \
  storage-component.googleapis.com \
  run.googleapis.com \
  pubsub.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

---

## Terraform Configuration Overview

### Variables

- **project_id:** Your GCP project ID.
- **region:** The region where resources will be deployed (default is `us-central1`).

You can set these in a `terraform.tfvars` file or pass them as command-line arguments.

### Resources Deployed

1. **Google Cloud Storage Bucket**

   - **Name:** `static-site-<project_id>`
   - **Configuration:** Set for static website hosting with `index.html` as the main page and `404.html` for not found errors.
   - **Note:** You need to upload your React build files (e.g., contents of the `build` directory) to this bucket. For public access, adjust the bucket’s IAM policy.
2. **Cloud Run Service**

   - **Name:** `express-backend`
   - **Image:** Expects a container image at `gcr.io/<project_id>/express-backend:latest`. Ensure your Express app is containerized and pushed to this location.
   - **Traffic:** All traffic routes to the latest revision.
3. **Pub/Sub Topic and Subscription**

   - **Topic Name:** `my-topic`
   - **Subscription Name:** `my-subscription`
   - These resources are automatically created and can be used for messaging between your services.

---

## Deployment Steps

1. **Clone the Repository**

   ```bash
   git clone <repository_url>
   cd <repository_directory>
   ```
2. **Initialize Terraform**

   ```bash
   terraform init
   ```
3. **Review the Terraform Plan**

   Replace `hip-apricot-429910-e1` and `your-region` with your actual project ID and desired region:

   ```bash
   terraform plan -var="project_id=hip-apricot-429910-e1" -var="region=us-central1"
   ```
4. **Apply the Configuration**

   ```bash
   terraform apply -var="project_id=hip-apricot-429910-e1" -var="region=us-central1"
   ```

   Confirm the prompt to proceed. Terraform will create the Cloud Storage bucket, Cloud Run service, and Pub/Sub resources.
5. **Post-Deployment Configuration**

   - **Cloud Storage Bucket (Static Website):**

     - **Upload Files:** Upload your React app’s build files (e.g., `index.html`, `404.html`, and other assets) to the bucket. You can use the `gsutil` tool:

       ```bash
       gsutil -m cp -r build/* gs://static-site-hip-apricot-429910-e1
       ```
     - **Set Public Read Access (if needed):**

       ```bash
       gsutil iam ch allUsers:objectViewer gs://static-site-hip-apricot-429910-e1
       ```
     - **Access the Website:** Visit the URL provided by the output:

       ```
       http://static-site-hip-apricot-429910-e1.storage.googleapis.com/index.html
       ```
   - **Cloud Run Service (Express Backend):**

     - **Build and Push Your Container Image:**

       ```bash
       # Build your Docker image
       docker build -t gcr.io/hip-apricot-429910-e1/express-backend:latest .

       # Push the image to Google Container Registry
       docker push gcr.io/hip-apricot-429910-e1/express-backend:latest
       ```
     - **Deployment:** The Cloud Run service will pick up the new image on the next Terraform apply. You may also trigger a new deployment manually via the Cloud Run console if needed.
   - **Pub/Sub:**

     - Use the created Pub/Sub topic and subscription within your application as needed.

---

## Cleanup

To remove all deployed resources, run:

```bash
terraform destroy -var="project_id=hip-apricot-429910-e1" -var="us-central1"
```

---

## Troubleshooting

- **API Errors:** Ensure all required APIs are enabled.
- **IAM Permissions:** Verify that the service account has sufficient permissions to create and manage the resources.
- **Resource Updates:** Changes to container images or website content may require re-deployments or manual updates.

For further details, refer to the [Terraform GCP Provider documentation](https://registry.terraform.io/providers/hashicorp/google/latest/docs).

---

Happy deploying!
