resource "google_artifact_registry_repository" "send_email_cloud_function" {
  location      = "northamerica-northeast1"
  repository_id = "send-email-cloud-function-docker-repo"
  format        = "DOCKER"
  kms_key_name  = var.send_email_cloud_function_northamerica_northeast1_confidential_crypto_key_id
}