output "api_cloud_run_services_names" {
  value = {
    northamerica-northeast1 = {
      name = google_cloud_run_v2_service.api["northamerica-northeast1"].name
    }
    northamerica-northeast2 = {
      name = google_cloud_run_v2_service.api["northamerica-northeast2"].name
    }
  }
}