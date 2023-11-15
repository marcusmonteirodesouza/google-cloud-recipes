resource "google_kms_crypto_key" "bootstrap_northamerica_northeast1_confidential" {
  name            = "bootstrap"
  key_ring        = google_kms_key_ring.northamerica_northeast1_confidential.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}