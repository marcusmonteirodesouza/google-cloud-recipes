resource "google_project_service_identity" "artifactregistry_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "artifactregistry.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "northamerica_northeast1_confidential_artifact_registry_sa" {
  for_each      = toset(local.northamerica_northeast1_confidential_crypto_key_ids)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.artifactregistry_sa.email}"
}