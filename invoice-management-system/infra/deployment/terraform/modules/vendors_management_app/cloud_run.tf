locals {
  service_name         = "vendors-management-app"
  backend_service_name = "${local.service_name}-backend"
}

resource "google_artifact_registry_repository_iam_member" "vendors_management_app_sa_vendors_management_app_repository" {
  location   = google_artifact_registry_repository.vendors_management_app.location
  repository = google_artifact_registry_repository.vendors_management_app.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${var.vendors_management_app_sa_email}"
}

resource "google_cloud_run_v2_service" "vendors_management_app" {
  name     = local.service_name
  location = "northamerica-northeast1"
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  template {
    service_account = var.vendors_management_app_sa_email
    encryption_key  = var.default_confidential_crypto_key_id

    scaling {
      max_instance_count = 3
    }

    containers {
      image = "${docker_registry_image.vendors_management_app.name}@${docker_registry_image.vendors_management_app.sha256_digest}"

      startup_probe {
        http_get {
          path = "/healthz"
        }
      }

      liveness_probe {
        http_get {
          path = "/healthz"
        }
      }

      env {
        name  = "GOOGLE_CLOUD_BACKEND_SERVICE_NAME"
        value = local.backend_service_name
      }
      env {
        name  = "GOOGLE_CLOUD_REGION"
        value = "northamerica-northeast1"
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT_ID"
        value = data.google_project.project.project_id
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT_NUMBER"
        value = data.google_project.project.number
      }
      env {
        name  = "LOG_LEVEL"
        value = "info"
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "VENDORS_SERVICE_BASE_URL"
        value = data.google_cloud_run_v2_service.vendors.uri
      }
    }

    vpc_access {
      connector = var.trust_vpc_access_connector_northamerica_northeast1_id
      egress    = "ALL_TRAFFIC"
    }
  }

  depends_on = [
    google_artifact_registry_repository_iam_member.vendors_management_app_sa_vendors_management_app_repository,
  ]
}

resource "google_cloud_run_service_iam_member" "vendors_management_app_allow_unauthenticated" {
  location = google_cloud_run_v2_service.vendors_management_app.location
  service  = google_cloud_run_v2_service.vendors_management_app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_service_iam_member" "vendors_management_app_iap_sa" {
  location = google_cloud_run_v2_service.vendors_management_app.location
  service  = google_cloud_run_v2_service.vendors_management_app.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${var.iap_sa_email}"
}