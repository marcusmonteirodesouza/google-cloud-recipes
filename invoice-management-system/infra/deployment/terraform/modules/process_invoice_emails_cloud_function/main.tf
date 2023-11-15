data "google_project" "project" {
}

data "google_cloud_run_v2_service" "invoices" {
  name     = var.invoices_service_name
  location = "northamerica-northeast1"
}

data "google_cloud_run_v2_service" "vendors" {
  name     = var.vendors_service_name
  location = "northamerica-northeast1"
}