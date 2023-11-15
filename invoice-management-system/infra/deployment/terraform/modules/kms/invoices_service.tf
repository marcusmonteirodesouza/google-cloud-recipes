resource "google_kms_crypto_key" "invoices_service_northamerica_northeast1_confidential" {
  name            = "invoices-service"
  key_ring        = google_kms_key_ring.northamerica_northeast1_confidential.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "invoices_service_northamerica_northeast1_restricted" {
  name            = "invoices-service"
  key_ring        = google_kms_key_ring.northamerica_northeast1_restricted.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "invoices_service_us_central1_restricted" {
  name            = "invoices-service"
  key_ring        = google_kms_key_ring.us_central1_restricted.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}