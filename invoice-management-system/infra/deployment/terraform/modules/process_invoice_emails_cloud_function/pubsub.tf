resource "google_pubsub_topic" "process_invoice_emails" {
  name         = "process-invoice-emails"
  kms_key_name = var.process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id
}
