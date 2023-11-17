data "google_project" "project" {
}

data "google_compute_network" "trust" {
  name = var.trust_network_name
}