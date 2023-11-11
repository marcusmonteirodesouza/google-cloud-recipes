locals {
  rotation_period = "7776000s" # 90 days
}

resource "google_kms_key_ring" "default" {
  name     = "default-northamerica-northeast1-keyring"
  location = "northamerica-northeast1"
}

resource "google_kms_crypto_key" "default_confidential" {
  name            = "confidential-key"
  key_ring        = google_kms_key_ring.default.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_key_ring" "documentai" {
  name     = "documentai-us-central1-keyring"
  location = "us-central1"
}

resource "google_kms_crypto_key" "documentai_confidential" {
  name            = "confidential-key"
  key_ring        = google_kms_key_ring.documentai.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}