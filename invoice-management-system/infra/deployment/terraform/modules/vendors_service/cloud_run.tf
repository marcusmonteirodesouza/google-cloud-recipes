resource "google_cloud_run_v2_service" "vendors_service" {
  name     = "vendors-service"
  location = "northamerica-northeast1"
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    service_account = var.vendors_service_sa_email
    encryption_key  = var.vendors_service_northamerica_northeast1_confidential_crypto_key_id

    scaling {
      max_instance_count = 3
    }

    containers {
      image = "${docker_registry_image.vendors_service.name}@${docker_registry_image.vendors_service.sha256_digest}"

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
        name  = "LOG_LEVEL"
        value = "info"
      }
      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PGHOST"
        value = google_sql_database_instance.vendors_service.private_ip_address
      }
      env {
        name  = "PGPORT"
        value = 5432
      }
      env {
        name  = "PGDATABASE"
        value = google_sql_database.vendors_service.name
      }
      env {
        name  = "PGUSERNAME"
        value = google_sql_user.vendors_service.name
      }
      env {
        name = "PGPASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.vendors_service_user_password.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "PGPOOL_MIN_CONNECTIONS"
        value = 0
      }
      env {
        name  = "PGPOOL_MAX_CONNECTIONS"
        value = 5
      }
    }

    vpc_access {
      connector = var.trust_vpc_access_connector_northamerica_northeast1_id
      egress    = "ALL_TRAFFIC"
    }
  }

  depends_on = [
    google_artifact_registry_repository_iam_member.vendors_service_repository_vendors_service_sa,
    google_secret_manager_secret_iam_member.vendors_service_user_password_vendors_service_sa
  ]
}

resource "google_cloud_run_service_iam_member" "vendors_service_allow_unauthenticated" {
  location = google_cloud_run_v2_service.vendors_service.location
  service  = google_cloud_run_v2_service.vendors_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}