resource "google_cloud_run_v2_service" "api" {
  name     = "api"
  location = "northamerica-northeast1"
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  template {
    service_account = var.api_sa_email
    encryption_key  = var.default_confidential_crypto_key_id

    containers {
      image = "${docker_registry_image.api.name}@${docker_registry_image.api.sha256_digest}"

      startup_probe {
        http_get {
          path = "/"
        }
      }

      liveness_probe {
        http_get {
          path = "/"
        }
      }

      env {
        name  = "LOG_LEVEL"
        value = "info"
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }
  }

  depends_on = [
    google_artifact_registry_repository_iam_member.api_sa
  ]
}

resource "google_cloud_run_service_iam_member" "api_allow_unauthenticated" {
  location = google_cloud_run_v2_service.api.location
  service  = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}