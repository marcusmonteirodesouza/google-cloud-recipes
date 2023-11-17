resource "google_kms_crypto_key" "documentai_warehouse_us_central1_restricted" {
  name            = "documentai-warehouse"
  key_ring        = google_kms_key_ring.us_central1_restricted.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}