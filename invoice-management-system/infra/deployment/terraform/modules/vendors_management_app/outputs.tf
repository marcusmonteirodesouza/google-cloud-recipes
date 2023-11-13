output "name" {
  value = google_cloud_run_v2_service.vendors_management_app.name
}

output "backend_service_name" {
  value = local.backend_service_name
}
