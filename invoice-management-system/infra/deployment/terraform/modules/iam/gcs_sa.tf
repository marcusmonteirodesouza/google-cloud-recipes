locals {
  gcs_sa_kms_crypto_keys = [
    var.bootstrap_northamerica_northeast1_confidential_crypto_key_id,
    var.invoices_service_northamerica_northeast1_restricted_crypto_key_id,
    var.send_email_cloud_function_northamerica_northeast1_confidential_crypto_key_id,
    var.process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id
  ]
}

data "google_storage_project_service_account" "gcs_sa" {
}

resource "google_kms_crypto_key_iam_member" "gcs_sa" {
  for_each      = toset(local.gcs_sa_kms_crypto_keys)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${data.google_storage_project_service_account.gcs_sa.email_address}"
}