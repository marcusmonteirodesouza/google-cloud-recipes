locals {
  documentai_warehouse_sa_kms_crypto_keys = [
    var.documentai_warehouse_us_central1_restricted_crypto_key_id,
  ]
}

resource "google_project_service_identity" "documentai_warehouse_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "contentwarehouse.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "documentai_warehouse_sa" {
  for_each      = toset(local.documentai_warehouse_sa_kms_crypto_keys)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.documentai_warehouse_sa.email}"
}