resource "google_project_service_identity" "documentai_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "documentai.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "documentai_sa_documentai_confidential" {
  crypto_key_id = var.documentai_confidential_crypto_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.documentai_sa.email}"
}