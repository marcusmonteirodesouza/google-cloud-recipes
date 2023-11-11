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
    default_kms_key_name = var.default_confidential_crypto_key_id
  }
}