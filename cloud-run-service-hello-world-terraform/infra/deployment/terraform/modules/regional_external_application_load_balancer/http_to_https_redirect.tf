resource "google_compute_region_url_map" "https_default" {
  name = "${local.service_name}-https-urlmap"

  default_url_redirect {
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"
    https_redirect         = true
    strip_query            = false
  }
}

resource "google_compute_region_target_http_proxy" "https_default" {
  name    = "${local.service_name}-http-proxy"
  url_map = google_compute_region_url_map.https_default.id
  region = "northamerica-northeast1"
}

resource "google_compute_forwarding_rule" "https_default" {
  name                  = "${local.service_name}-https-fr"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  target                = google_compute_region_target_http_proxy.https_default.id
  ip_address            = var.google_compute_address_id
  network               = var.network_name
  port_range            = "80"
  network_tier          = "STANDARD"
}