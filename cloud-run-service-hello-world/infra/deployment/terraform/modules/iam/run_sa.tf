resource "google_project_service_identity" "run_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "run.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "run_sa_default_northamerica_northeast1_confidential" {
  crypto_key_id = var.default_northamerica_northeast1_confidential_crypto_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.run_sa.email}"
}

resource "google_kms_crypto_key_iam_member" "run_sa_default_northamerica_northeast2_confidential" {
  crypto_key_id = var.default_northamerica_northeast2_confidential_crypto_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.run_sa.email}"
}