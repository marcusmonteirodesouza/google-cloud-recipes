locals {
  rotation_period = "7776000s" # 90 days
}

resource "google_kms_key_ring" "default_northamerica_northeast1" {
  name     = "default-northamerica-northeast1-keyring"
  location = "northamerica-northeast1"
}

resource "google_kms_crypto_key" "default_northamerica_northeast1_confidential" {
  name            = "confidential-key"
  key_ring        = google_kms_key_ring.default_northamerica_northeast1.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_key_ring" "default_northamerica_northeast2" {
  name     = "default-northamerica-northeast2-keyring"
  location = "northamerica-northeast2"
}

resource "google_kms_crypto_key" "default_northamerica_northeast2_confidential" {
  name            = "confidential-key"
  key_ring        = google_kms_key_ring.default_northamerica_northeast2.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}