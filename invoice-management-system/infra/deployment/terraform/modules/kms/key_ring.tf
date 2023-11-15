resource "google_kms_key_ring" "northamerica_northeast1_confidential" {
  name     = "northamerica-northeast1-confidential"
  location = "northamerica-northeast1"
}

resource "google_kms_key_ring" "northamerica_northeast1_restricted" {
  name     = "northamerica-northeast1-restricted"
  location = "northamerica-northeast1"
}

resource "google_kms_key_ring" "us_central1_restricted" {
  name     = "us-central1-restricted"
  location = "us-central1"
}