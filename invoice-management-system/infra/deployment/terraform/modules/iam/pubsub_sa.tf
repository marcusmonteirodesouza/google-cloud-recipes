locals {
  pubsub_sa_kms_crypto_keys = [
    var.send_email_cloud_function_northamerica_northeast1_confidential_crypto_key_id
  ]
}

resource "google_project_service_identity" "pubsub_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "pubsub.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "pubsub_sa" {
  for_each      = toset(local.pubsub_sa_kms_crypto_keys)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.pubsub_sa.email}"
}