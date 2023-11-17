locals {
  documentai_sa_kms_crypto_keys = [
    var.invoices_service_us_central1_restricted_crypto_key_id,
  ]
}

resource "google_project_service_identity" "documentai_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "documentai.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "documentai_sa" {
  for_each      = toset(local.documentai_sa_kms_crypto_keys)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.documentai_sa.email}"
}