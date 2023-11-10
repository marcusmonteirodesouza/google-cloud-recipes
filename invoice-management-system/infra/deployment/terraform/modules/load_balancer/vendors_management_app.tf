resource "google_compute_region_network_endpoint_group" "vendors_management_app_service" {
  name                  = "${var.vendors_management_app_cloud_run_service_name}-neg"
  network_endpoint_type = "SERVERLESS"
  region                = "northamerica-northeast1"
  cloud_run {
    service = var.vendors_management_app_cloud_run_service_name
  }
}

resource "google_compute_region_backend_service" "vendors_management_app_service" {
  name                  = var.vendors_management_app_backend_service_name
  region                = "northamerica-northeast1"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group           = google_compute_region_network_endpoint_group.vendors_management_app_service.id
    balancing_mode  = "UTILIZATION"
    capacity_scaler = 1.0
  }

  iap {
    oauth2_client_id     = var.vendors_management_app_iap_client_id
    oauth2_client_secret = var.vendors_management_app_iap_client_secret
  }
}

resource "google_compute_region_backend_service_iam_member" "vendors_management_app_service_vendors_management_app_sa" {
  provider = google-beta
  project  = google_compute_region_backend_service.vendors_management_app_service.project
  name     = google_compute_region_backend_service.vendors_management_app_service.name
  region   = google_compute_region_backend_service.vendors_management_app_service.region
  role     = "roles/compute.viewer"
  member   = "serviceAccount:${var.vendors_management_app_sa_email}"
}

resource "google_iap_web_region_backend_service_iam_member" "vendors_management_app_service" {
  project                    = google_compute_region_backend_service.vendors_management_app_service.project
  web_region_backend_service = google_compute_region_backend_service.vendors_management_app_service.name
  region                     = google_compute_region_backend_service.vendors_management_app_service.region
  role                       = "roles/iap.httpsResourceAccessor"
  member                     = "group:${var.vendors_management_app_users_group}"
}