locals {
  secret_manager_sa_kms_crypto_keys = [
    var.bootstrap_northamerica_northeast1_confidential_crypto_key_id,
    var.invoices_service_northamerica_northeast1_confidential_crypto_key_id,
    var.invoices_service_northamerica_northeast1_restricted_crypto_key_id,
    var.vendors_management_app_northamerica_northeast1_confidential_crypto_key_id,
    var.vendors_service_northamerica_northeast1_confidential_crypto_key_id,
    var.send_email_cloud_function_northamerica_northeast1_confidential_crypto_key_id,
    var.process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id,
    var.process_invoice_emails_cloud_function_northamerica_northeast1_restricted_crypto_key_id
  ]
}

resource "google_project_service_identity" "secretmanager_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "secretmanager.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "secret_manager_sa" {
  for_each      = toset(local.secret_manager_sa_kms_crypto_keys)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.secretmanager_sa.email}"
}