output "default_confidential_crypto_key_id" {
  value = google_kms_crypto_key.default_confidential.id
}

output "documentai_confidential_crypto_key_id" {
  value = google_kms_crypto_key.documentai_confidential.id
}