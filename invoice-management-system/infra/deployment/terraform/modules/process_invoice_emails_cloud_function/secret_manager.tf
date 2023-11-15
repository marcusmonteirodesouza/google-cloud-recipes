resource "google_secret_manager_secret" "gmail_app_password" {
  secret_id = "process-invoice-emails-gmail-app-password"

  replication {
    user_managed {
      replicas {
        location = "northamerica-northeast1"

        customer_managed_encryption {
          kms_key_name = var.process_invoice_emails_cloud_function_northamerica_northeast1_restricted_crypto_key_id
        }
      }
    }
  }
}

resource "google_secret_manager_secret_version" "gmail_app_password" {
  secret      = google_secret_manager_secret.gmail_app_password.id
  secret_data = var.gmail_app_password
}

resource "google_secret_manager_secret_iam_member" "gmail_app_password_process_invoice_emails_cloud_function_sa" {
  secret_id = google_secret_manager_secret.gmail_app_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.process_invoice_emails_cloud_function_sa_email}"
}