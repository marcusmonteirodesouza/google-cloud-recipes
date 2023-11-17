locals {
  run_sa_kms_crypto_keys = [
    var.invoices_service_northamerica_northeast1_confidential_crypto_key_id,
    var.vendors_management_app_northamerica_northeast1_confidential_crypto_key_id,
    var.vendors_service_northamerica_northeast1_confidential_crypto_key_id
  ]
}

resource "google_project_service_identity" "run_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "run.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "run_sa" {
  for_each      = toset(local.run_sa_kms_crypto_keys)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.run_sa.email}"
}