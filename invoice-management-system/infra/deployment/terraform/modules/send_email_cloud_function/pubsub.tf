resource "google_pubsub_topic" "send_email" {
  name         = "send-email"
  kms_key_name = var.send_email_cloud_function_northamerica_northeast1_confidential_crypto_key_id
}
