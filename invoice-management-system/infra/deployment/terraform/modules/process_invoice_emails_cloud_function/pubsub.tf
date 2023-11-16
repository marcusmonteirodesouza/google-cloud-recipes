resource "google_pubsub_topic" "process_invoice_emails" {
  name         = "process-invoice-emails"
  kms_key_name = var.process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id
  message_storage_policy {
    allowed_persistence_regions = [
      "northamerica-northeast1"
    ]
  }
}

resource "google_pubsub_topic_iam_member" "send_email_process_invoice_emails_sa" {
  topic  = var.send_email_pubsub_topic_name
  role   = "roles/pubsub.publisher"
  member = "serviceAccount:${var.process_invoice_emails_cloud_function_sa_email}"
}
