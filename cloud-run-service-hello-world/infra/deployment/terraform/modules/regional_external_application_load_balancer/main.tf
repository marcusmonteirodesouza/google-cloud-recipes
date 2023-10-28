locals {
  service_name = "hello-world"
}

resource "google_compute_region_network_endpoint_group" "lb_default" {
  name                  = "${local.service_name}-neg"
  network_endpoint_type = "SERVERLESS"
  region                = "northamerica-northeast1"
  cloud_run {
    service = var.api_cloud_run_service_name
  }
}

resource "google_compute_region_backend_service" "lb_default" {
  name                  = "${local.service_name}-backend"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group           = google_compute_region_network_endpoint_group.lb_default.id
    balancing_mode  = "UTILIZATION"
    capacity_scaler = 1.0
  }
}

resource "google_compute_region_url_map" "lb_default" {
  name            = "${local.service_name}-lb-urlmap"
  default_service = google_compute_region_backend_service.lb_default.id

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_region_backend_service.lb_default.id
    route_rules {
      priority = 1
      url_redirect {
        https_redirect         = true
        redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
      }
    }
  }
}

# TODO(Marcus): See about using a RegionSslCertificate https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/compute_region_ssl_certificate
resource "google_compute_region_ssl_certificate" "lb_default" {
  name        = "${local.service_name}-ssl-cert"
  certificate = var.ssl_certificate
  private_key = var.ssl_certificate_private_key

  lifecycle {
    create_before_destroy = true
  }
}

resource "google_compute_region_target_https_proxy" "lb_default" {
  name    = "${local.service_name}-https-proxy"
  url_map = google_compute_region_url_map.lb_default.id
  ssl_certificates = [
    google_compute_region_ssl_certificate.lb_default.name
  ]
}

resource "google_compute_forwarding_rule" "lb_default" {
  name                  = "${local.service_name}-lb-fr"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  target                = google_compute_region_target_https_proxy.lb_default.id
  ip_address            = var.google_compute_address_id
  network               = var.network_name
  port_range            = "443"
  network_tier          = "STANDARD"
}
