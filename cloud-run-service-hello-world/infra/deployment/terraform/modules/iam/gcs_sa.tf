data "google_storage_project_service_account" "gcs_sa" {
}

resource "google_kms_crypto_key_iam_member" "gcs_sa_default_northamerica_northeast1_confidential" {
  crypto_key_id = var.default_northamerica_northeast1_confidential_crypto_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${data.google_storage_project_service_account.gcs_sa.email_address}"
}