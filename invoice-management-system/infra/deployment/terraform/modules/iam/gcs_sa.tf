data "google_storage_project_service_account" "gcs_sa" {
}

resource "google_kms_crypto_key_iam_member" "northamerica_northeast1_confidential_gcs_sa" {
  for_each      = toset(local.northamerica_northeast1_confidential_crypto_key_ids)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${data.google_storage_project_service_account.gcs_sa.email_address}"
}

resource "google_kms_crypto_key_iam_member" "northamerica_northeast1_restricted_gcs_sa" {
  for_each      = toset(local.northamerica_northeast1_restricted_crypto_key_ids)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${data.google_storage_project_service_account.gcs_sa.email_address}"
}

resource "google_kms_crypto_key_iam_member" "bootstrap_northamerica_northeast1_confidential_gcs_sa" {
  crypto_key_id = var.bootstrap_northamerica_northeast1_confidential_crypto_key_id
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${data.google_storage_project_service_account.gcs_sa.email_address}"
}