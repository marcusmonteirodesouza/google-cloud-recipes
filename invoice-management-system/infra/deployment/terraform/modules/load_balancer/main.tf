locals {
  lb_name = "invoice-management-system"
}

resource "google_compute_region_url_map" "default" {
  name            = "${local.lb_name}-lb-urlmap"
  default_service = google_compute_region_backend_service.vendors_management_app_service.id

  host_rule {
    hosts        = [var.vendors_management_app_domain]
    path_matcher = "vendors-management-app"
  }

  path_matcher {
    name            = "vendors-management-app"
    default_service = google_compute_region_backend_service.vendors_management_app_service.id
  }

  # host_rule {
  #   hosts        = [var.authorize_gmail_access_cloud_function_domain]
  #   path_matcher = "authorize-gmail-access-cloud-function"
  # }

  # path_matcher {
  #   name            = "authorize-gmail-access-cloud-function"
  #   default_service = google_compute_region_backend_service.authorize_gmail_access_init_cloud_function_service.id
  # }
}

resource "google_compute_region_ssl_certificate" "default" {
  name        = "${local.lb_name}-self-managed-ssl-cert"
  certificate = var.ssl_certificate
  private_key = var.ssl_certificate_private_key

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_region_target_https_proxy" "default" {
  name    = "${local.lb_name}-https-proxy"
  url_map = google_compute_region_url_map.default.id
  ssl_certificates = [
    google_compute_region_ssl_certificate.default.name
  ]
}

resource "google_compute_forwarding_rule" "default" {
  name                  = "${local.lb_name}-lb-fr"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  target                = google_compute_region_target_https_proxy.default.id
  ip_address            = var.google_compute_address_id
  network               = var.trust_network_name
  port_range            = "443"
  network_tier          = "STANDARD"
}
