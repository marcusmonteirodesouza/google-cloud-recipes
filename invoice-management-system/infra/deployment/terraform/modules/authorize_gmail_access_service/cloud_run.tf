resource "google_artifact_registry_repository_iam_member" "authorize_gmail_access_service_repository_authorize_gmail_access_service_sa" {
  location   = google_artifact_registry_repository.authorize_gmail_access_service.location
  repository = google_artifact_registry_repository.authorize_gmail_access_service.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${var.authorize_gmail_access_service_sa_email}"
}

resource "google_secret_manager_secret_iam_member" "authorize_gmail_access_service_user_password_authorize_gmail_access_service_sa" {
  secret_id = var.oauth2_client_secret_secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.authorize_gmail_access_service_sa_email}"
}

resource "google_cloud_run_v2_service" "authorize_gmail_access_service" {
  name     = "authorize-gmail-access-service"
  location = "northamerica-northeast1"
  ingress  = "INGRESS_TRAFFIC_INTERNAL_ONLY"

  template {
    service_account = var.authorize_gmail_access_service_sa_email
    encryption_key  = var.default_confidential_crypto_key_id

    scaling {
      max_instance_count = 3
    }

    containers {
      image = "${docker_registry_image.authorize_gmail_access_service.name}@${docker_registry_image.authorize_gmail_access_service.sha256_digest}"

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
        name  = "BASE_URL"
        value = "https://${var.authorize_gmail_access_service_domain}"
      }
      env {
        name  = "GMAIL_ADDRESS"
        value = var.authorize_gmail_access_service_sa_email
      }
      env {
        name  = "GMAIL_PUSH_NOTIFICATIONS_PUBSUB_TOPIC_ID"
        value = google_pubsub_topic.gmail_push_notifications.id
      }
      env {
        name  = "GOOGLE_OAUTH2_CLIENT_ID"
        value = var.oauth2_client_id
      }
      env {
        name = "GOOGLE_OAUTH2_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = var.oauth2_client_secret_secret_id
            version = "latest"
          }
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

    vpc_access {
      connector = var.trust_vpc_access_connector_northamerica_northeast1_id
      egress    = "ALL_TRAFFIC"
    }
  }

  depends_on = [
    google_artifact_registry_repository_iam_member.authorize_gmail_access_service_repository_authorize_gmail_access_service_sa,
    google_secret_manager_secret_iam_member.authorize_gmail_access_service_user_password_authorize_gmail_access_service_sa,
    google_pubsub_topic_iam_member.gmail_push_notifications_gmail_api_push_sa
  ]
}

resource "google_cloud_run_service_iam_member" "authorize_gmail_access_service_allow_unauthenticated" {
  location = google_cloud_run_v2_service.authorize_gmail_access_service.location
  service  = google_cloud_run_v2_service.authorize_gmail_access_service.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}