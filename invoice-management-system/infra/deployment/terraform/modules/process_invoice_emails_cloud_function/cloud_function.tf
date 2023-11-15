locals {
  cloud_function_dir = "${path.module}/../../../../../process-invoice-emails-cloud-function"

  cloud_function_zip_path = "${path.module}/process-invoice-emails-cloud-function.zip"
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
    default_kms_key_name = var.process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id
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
  name   = "process-invoice-emails-cloud-function.${data.archive_file.cloud_function_code.output_md5}.zip"
  bucket = google_storage_bucket.cloud_function_code.name
  source = local.cloud_function_zip_path
}

resource "google_cloudfunctions2_function" "process_invoice_emails" {
  name        = "process-invoice-emails"
  location    = "northamerica-northeast1"
  description = "Process Invoice Emails"

  build_config {
    runtime     = "python312"
    entry_point = "process_invoice_emails"

    source {
      storage_source {
        bucket = google_storage_bucket.cloud_function_code.name
        object = google_storage_bucket_object.cloud_function_code.name
      }
    }
  }

  service_config {
    service_account_email = var.process_invoice_emails_cloud_function_sa_email

    environment_variables = {
      GMAIL_ADDRESS             = var.gmail_address
      LOG_LEVEL                 = "INFO"
      INVOICES_SERVICE_BASE_URL = data.google_cloud_run_v2_service.invoices.uri
      VENDORS_SERVICE_BASE_URL  = data.google_cloud_run_v2_service.vendors.uri
    }

    secret_environment_variables {
      key        = "GMAIL_APP_PASSWORD"
      project_id = google_secret_manager_secret.gmail_app_password.project
      secret     = google_secret_manager_secret.gmail_app_password.secret_id
      version    = "latest"
    }

    vpc_connector                 = var.trust_vpc_access_connector_northamerica_northeast1_id
    vpc_connector_egress_settings = "ALL_TRAFFIC"
  }

  event_trigger {
    trigger_region = "northamerica-northeast1"
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = google_pubsub_topic.process_invoice_emails.id
    retry_policy   = "RETRY_POLICY_RETRY"
  }

  depends_on = [
    google_secret_manager_secret_iam_member.gmail_app_password_process_invoice_emails_cloud_function_sa
  ]
}