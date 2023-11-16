locals {
  cloud_function_dir = "${path.module}/../../../../../send-email-cloud-function"

  cloud_function_zip_path = "${path.module}/send-email-cloud-function.zip"
}

resource "random_uuid" "cloud_function_code_bucket" {
}

resource "google_storage_bucket" "cloud_function_code" {
  name                        = random_uuid.cloud_function_code_bucket.result
  location                    = "northamerica-northeast1"
  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  encryption {
    default_kms_key_name = var.send_email_cloud_function_northamerica_northeast1_confidential_crypto_key_id
  }
}

data "archive_file" "cloud_function_code" {
  type        = "zip"
  source_dir  = local.cloud_function_dir
  output_path = local.cloud_function_zip_path

  excludes = [
    ".env"
  ]
}

resource "google_storage_bucket_object" "cloud_function_code" {
  name   = "send-email-cloud-function.${data.archive_file.cloud_function_code.output_md5}.zip"
  bucket = google_storage_bucket.cloud_function_code.name
  source = local.cloud_function_zip_path
}

resource "google_cloudfunctions2_function" "send_email" {
  name        = "send-email"
  location    = "northamerica-northeast1"
  description = "Process Invoice Emails"

  kms_key_name = var.send_email_cloud_function_northamerica_northeast1_confidential_crypto_key_id

  build_config {
    runtime     = "python312"
    entry_point = "send_email"

    docker_repository = google_artifact_registry_repository.send_email_cloud_function.id

    source {
      storage_source {
        bucket = google_storage_bucket.cloud_function_code.name
        object = google_storage_bucket_object.cloud_function_code.name
      }
    }
  }

  service_config {
    service_account_email = var.send_email_cloud_function_sa_email

    environment_variables = {
      SENDGRID_FROM_EMAIL = var.sendgrid_from_email
      LOG_LEVEL           = "INFO"
    }

    secret_environment_variables {
      key        = "SENDGRID_API_KEY"
      project_id = google_secret_manager_secret.sendgrid_api_key.project
      secret     = google_secret_manager_secret.sendgrid_api_key.secret_id
      version    = "latest"
    }

    vpc_connector                 = var.trust_vpc_access_connector_northamerica_northeast1_id
    vpc_connector_egress_settings = "ALL_TRAFFIC"
  }

  event_trigger {
    trigger_region = "northamerica-northeast1"
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = google_pubsub_topic.send_email.id
    retry_policy   = "RETRY_POLICY_RETRY"
  }

  depends_on = [
    google_secret_manager_secret_iam_member.sendgrid_api_key_send_email_cloud_function_sa
  ]
}