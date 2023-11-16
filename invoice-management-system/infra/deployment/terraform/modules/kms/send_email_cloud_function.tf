resource "google_kms_crypto_key" "send_email_cloud_function_northamerica_northeast1_confidential" {
  name            = "send-email-cloud-function"
  key_ring        = google_kms_key_ring.northamerica_northeast1_confidential.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}