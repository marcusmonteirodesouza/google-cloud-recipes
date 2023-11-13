locals {
  gmail_api_push_sa_email = "gmail-api-push@system.gserviceaccount.com"
}

resource "google_pubsub_topic" "gmail_push_notifications" {
  name         = "gmail-push-notifications-${split("@", var.authorize_gmail_access_service_gmail_address)[0]}"
  kms_key_name = var.default_confidential_crypto_key_id

  message_storage_policy {
    allowed_persistence_regions = [
      "northamerica-northeast1"
    ]
  }
}

resource "google_pubsub_topic_iam_member" "gmail_push_notifications_gmail_api_push_sa" {
  project = google_pubsub_topic.gmail_push_notifications.project
  topic   = google_pubsub_topic.gmail_push_notifications.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${local.gmail_api_push_sa_email}"
}