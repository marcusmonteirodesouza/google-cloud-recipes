output "name" {
  value = google_cloud_run_v2_service.vendors_management_app.name
}

output "backend_service_name" {
  value = local.backend_service_name
}

output "iap_client_id" {
  value = google_iap_client.vendors_management_app.client_id
}

output "iap_client_secret" {
  value = google_iap_client.vendors_management_app.secret
}