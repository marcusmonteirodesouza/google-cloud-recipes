resource "google_cloud_run_v2_service" "api" {
  for_each = var.api_cloud_run_services_configs
  name     = "api"
  location = each.key
  ingress  = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  template {
    service_account = var.api_sa_email
    encryption_key  = each.value.kms_crypto_key_id

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
  for_each = google_cloud_run_v2_service.api
  location = each.value.location
  service  = each.value.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}