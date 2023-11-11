data "google_project" "project" {
}

data "google_compute_network" "trust" {
  name = var.trust_network_name
}

data "google_cloud_run_v2_service" "vendors" {
  name     = var.vendors_service_name
  location = "northamerica-northeast1"
}