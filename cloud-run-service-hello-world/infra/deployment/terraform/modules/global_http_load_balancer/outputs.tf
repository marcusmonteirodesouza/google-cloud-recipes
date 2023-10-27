output "ssl_certificate_name" {
  value = google_compute_managed_ssl_certificate.lb_default.name
}