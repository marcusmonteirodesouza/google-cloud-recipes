resource "google_compute_network" "vpc" {
  # See https://cloud.google.com/architecture/best-practices-vpc-design#naming
  name                    = "gcloudrecipes-${var.environment}-vpc-1"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
}

resource "google_compute_subnetwork" "proxy_only_northamerica_northeast1" {
  name          = "gcloudrecipes-${var.environment}-proxy-na-ne1-subnet"
  ip_cidr_range = "10.129.0.0/26"
  region        = "northamerica-northeast1"
  network       = google_compute_network.vpc.id
  purpose       = "REGIONAL_MANAGED_PROXY"
  role          = "ACTIVE"
}