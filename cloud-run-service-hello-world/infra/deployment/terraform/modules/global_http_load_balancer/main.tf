locals {
  service_name = "hello-world"
}

resource "google_compute_region_network_endpoint_group" "lb_default" {
  for_each              = var.api_cloud_run_services_names
  name                  = "${local.service_name}-neg"
  network_endpoint_type = "SERVERLESS"
  region                = each.key
  cloud_run {
    service = each.value.name
  }
}

resource "google_compute_backend_service" "lb_default" {
  name                  = "${local.service_name}-backend"
  load_balancing_scheme = "EXTERNAL_MANAGED"

  backend {
    group = google_compute_region_network_endpoint_group.lb_default["northamerica-northeast1"].id
  }

  backend {
    group = google_compute_region_network_endpoint_group.lb_default["northamerica-northeast2"].id
  }
}

resource "google_compute_url_map" "lb_default" {
  name            = "${local.service_name}-lb-urlmap"
  default_service = google_compute_backend_service.lb_default.id

  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.lb_default.id
    route_rules {
      priority = 1
      url_redirect {
        https_redirect         = true
        redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
      }
    }
  }
}

resource "google_compute_managed_ssl_certificate" "lb_default" {
  name = "${local.service_name}-ssl-cert"

  managed {
    domains = var.domain_names
  }
}

resource "google_compute_target_https_proxy" "lb_default" {
  name    = "${local.service_name}-https-proxy"
  url_map = google_compute_url_map.lb_default.id
  ssl_certificates = [
    google_compute_managed_ssl_certificate.lb_default.name
  ]
  depends_on = [
    google_compute_managed_ssl_certificate.lb_default
  ]
}

resource "google_compute_global_forwarding_rule" "lb_default" {
  name                  = "${local.service_name}-lb-fr"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  target                = google_compute_target_https_proxy.lb_default.id
  ip_address            = var.ip_address
  port_range            = "443"
  depends_on            = [google_compute_target_https_proxy.lb_default]
}