resource "google_cloud_scheduler_job" "process_invoice_emails" {
  name        = "process-invoice-emails"
  description = "Process Invoice Emails"
  region      = "northamerica-northeast1"
  schedule    = "*/5 * * * *"

  pubsub_target {
    topic_name = google_pubsub_topic.process_invoice_emails.id
    data       = base64encode("{}")
  }
}