resource "google_kms_crypto_key" "process_invoice_emails_cloud_function_northamerica_northeast1_confidential" {
  name            = "process-invoice-emails-cloud-function"
  key_ring        = google_kms_key_ring.northamerica_northeast1_confidential.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "process_invoice_emails_cloud_function_northamerica_northeast1_restricted" {
  name            = "process-invoice-emails-cloud-function"
  key_ring        = google_kms_key_ring.northamerica_northeast1_restricted.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}