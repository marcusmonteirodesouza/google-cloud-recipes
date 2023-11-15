resource "google_project_service_identity" "secretmanager_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "secretmanager.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "northamerica_northeast1_restricted_secret_manager_sa" {
  for_each      = toset(local.northamerica_northeast1_restricted_crypto_key_ids)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.secretmanager_sa.email}"
}

resource "google_kms_crypto_key_iam_member" "bootstrap_northamerica_northeast1_confidential_secret_manager_sa" {
  crypto_key_id = var.bootstrap_northamerica_northeast1_confidential_crypto_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.secretmanager_sa.email}"
}