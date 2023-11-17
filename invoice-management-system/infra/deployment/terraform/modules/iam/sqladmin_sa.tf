locals {
  sqladmin_sa_kms_crypto_keys = [
    var.invoices_service_northamerica_northeast1_restricted_crypto_key_id,
    var.vendors_service_northamerica_northeast1_restricted_crypto_key_id,
  ]
}

resource "google_project_service_identity" "sqladmin_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "sqladmin.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "sqladmin_sa" {
  for_each      = toset(local.sqladmin_sa_kms_crypto_keys)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.sqladmin_sa.email}"
}