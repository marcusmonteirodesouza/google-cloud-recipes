locals {
  northamerica_northeast1_confidential_crypto_key_ids = [
    var.invoices_service_northamerica_northeast1_confidential_crypto_key_id,
    var.vendors_management_app_northamerica_northeast1_confidential_crypto_key_id,
    var.vendors_service_northamerica_northeast1_confidential_crypto_key_id,
    var.process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id
  ]

  northamerica_northeast1_restricted_crypto_key_ids = [
    var.invoices_service_northamerica_northeast1_restricted_crypto_key_id,
    var.vendors_service_northamerica_northeast1_restricted_crypto_key_id,
    var.process_invoice_emails_cloud_function_northamerica_northeast1_restricted_crypto_key_id
  ]

  us_central1_restricted_crypto_key_ids = [
    var.invoices_service_us_central1_restricted_crypto_key_id
  ]
}

data "google_project" "project" {
}