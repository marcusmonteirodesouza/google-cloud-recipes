data "google_project" "project" {
}

resource "google_document_ai_warehouse_location" "default" {
  location                      = "us" # At the moment (2023-11) only the 'us' location is allowed
  project_number                = data.google_project.project.number
  access_control_mode           = "ACL_MODE_DOCUMENT_LEVEL_ACCESS_CONTROL_GCI"
  database_type                 = "DB_INFRA_SPANNER"
  kms_key                       = var.documentai_warehouse_us_central1_restricted_crypto_key_id
  document_creator_default_role = "DOCUMENT_ADMIN"
}