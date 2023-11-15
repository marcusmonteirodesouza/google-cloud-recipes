resource "random_uuid" "invoice_documents_bucket" {
}

resource "google_storage_bucket" "invoice_documents" {
  name     = random_uuid.invoice_documents_bucket.result
  location = "northamerica-northeast1"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  encryption {
    default_kms_key_name = var.invoices_service_northamerica_northeast1_restricted_crypto_key_id
  }
}

resource "google_storage_bucket_iam_member" "invoice_documents_invoices_service_sa" {
  bucket = google_storage_bucket.invoice_documents.name
  role   = "roles/storage.objectUser"
  member = "serviceAccount:${var.invoices_service_sa_email}"
}