resource "google_project_service_identity" "secretmanager_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "secretmanager.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "secretmanager_sa_default_northamerica_northeast1_confidential" {
  crypto_key_id = var.default_northamerica_northeast1_confidential_crypto_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.secretmanager_sa.email}"
}