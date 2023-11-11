resource "google_document_ai_processor" "invoice_parser" {
  location     = "us"
  display_name = "Invoices Service Invoice Parser"
  type         = "INVOICE_PROCESSOR"
  kms_key_name = var.documentai_confidential_crypto_key_id
}