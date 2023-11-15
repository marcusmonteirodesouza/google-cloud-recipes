resource "google_kms_crypto_key" "vendors_service_northamerica_northeast1_confidential" {
  name            = "vendors-service"
  key_ring        = google_kms_key_ring.northamerica_northeast1_confidential.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "vendors_service_northamerica_northeast1_restricted" {
  name            = "vendors-service"
  key_ring        = google_kms_key_ring.northamerica_northeast1_restricted.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}