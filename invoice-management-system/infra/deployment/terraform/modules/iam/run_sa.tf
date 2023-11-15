resource "google_project_service_identity" "run_sa" {
  provider = google-beta

  project = data.google_project.project.project_id
  service = "run.googleapis.com"
}

resource "google_kms_crypto_key_iam_member" "northamerica_northeast1_confidential_run_sa" {
  for_each      = toset(local.northamerica_northeast1_confidential_crypto_key_ids)
  crypto_key_id = each.value
  role          = "roles/cloudkms.cryptoKeyEncrypterDecrypter"
  member        = "serviceAccount:${google_project_service_identity.run_sa.email}"
}