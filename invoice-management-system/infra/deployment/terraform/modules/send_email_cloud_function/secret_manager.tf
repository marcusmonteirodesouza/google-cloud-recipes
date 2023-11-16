resource "google_secret_manager_secret" "sendgrid_api_key" {
  secret_id = "sendgrid-api-key"

  replication {
    user_managed {
      replicas {
        location = "northamerica-northeast1"

        customer_managed_encryption {
          kms_key_name = var.send_email_cloud_function_northamerica_northeast1_confidential_crypto_key_id
        }
      }
    }
  }
}

resource "google_secret_manager_secret_version" "sendgrid_api_key" {
  secret      = google_secret_manager_secret.sendgrid_api_key.id
  secret_data = var.sendgrid_api_key
}

resource "google_secret_manager_secret_iam_member" "sendgrid_api_key_send_email_cloud_function_sa" {
  secret_id = google_secret_manager_secret.sendgrid_api_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.send_email_cloud_function_sa_email}"
}