resource "google_secret_manager_secret" "oauth2_client_secret" {
  secret_id = "oauth2-client-secret"

  replication {
    user_managed {
      replicas {
        location = "northamerica-northeast1"

        customer_managed_encryption {
          kms_key_name = module.kms.default_confidential_crypto_key_id
        }
      }
    }
  }

  depends_on = [
    module.iam
  ]
}

resource "google_secret_manager_secret_version" "oauth2_client_secret" {
  secret      = google_secret_manager_secret.oauth2_client_secret.id
  secret_data = var.oauth2_client_secret
}