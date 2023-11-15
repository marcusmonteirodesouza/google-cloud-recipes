resource "google_kms_crypto_key" "vendors_management_app_northamerica_northeast1_confidential" {
  name            = "vendors-management-app"
  key_ring        = google_kms_key_ring.northamerica_northeast1_confidential.id
  rotation_period = local.rotation_period

  lifecycle {
    prevent_destroy = true
  }
}
