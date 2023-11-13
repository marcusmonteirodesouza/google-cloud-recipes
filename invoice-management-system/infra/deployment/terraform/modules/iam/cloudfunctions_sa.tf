resource "google_project_service_identity" "cloudfunctions_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "cloudfunctions.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "cloudfunctions_sa_default_confidential" {
  crypto_key_id = var.default_confidential_crypto_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.cloudfunctions_sa.email}"
}