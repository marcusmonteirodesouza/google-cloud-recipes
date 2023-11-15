output "bootstrap_northamerica_northeast1_confidential_crypto_key_id" {
  value = google_kms_crypto_key.bootstrap_northamerica_northeast1_confidential.id
}

output "invoices_service_northamerica_northeast1_confidential_crypto_key_id" {
  value = google_kms_crypto_key.invoices_service_northamerica_northeast1_confidential.id
}

output "invoices_service_northamerica_northeast1_restricted_crypto_key_id" {
  value = google_kms_crypto_key.invoices_service_northamerica_northeast1_restricted.id
}

output "invoices_service_us_central1_restricted_crypto_key_id" {
  value = google_kms_crypto_key.invoices_service_us_central1_restricted.id
}

output "vendors_management_app_northamerica_northeast1_confidential_crypto_key_id" {
  value = google_kms_crypto_key.vendors_management_app_northamerica_northeast1_confidential.id
}

output "vendors_service_northamerica_northeast1_confidential_crypto_key_id" {
  value = google_kms_crypto_key.vendors_service_northamerica_northeast1_confidential.id
}

output "vendors_service_northamerica_northeast1_restricted_crypto_key_id" {
  value = google_kms_crypto_key.vendors_service_northamerica_northeast1_restricted.id
}