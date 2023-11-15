resource "google_project_service_identity" "documentai_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "documentai.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "us_central1_restricted_documentai_sa" {
  for_each      = toset(local.us_central1_restricted_crypto_key_ids)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.documentai_sa.email}"
}