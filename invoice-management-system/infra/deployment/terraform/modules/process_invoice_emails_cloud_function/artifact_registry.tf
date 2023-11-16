resource "google_artifact_registry_repository" "process_invoice_emails_cloud_function" {
  location      = "northamerica-northeast1"
  repository_id = "process-invoice-emails-cloud-function-docker-repo"
  format        = "DOCKER"
  kms_key_name  = var.process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id
}