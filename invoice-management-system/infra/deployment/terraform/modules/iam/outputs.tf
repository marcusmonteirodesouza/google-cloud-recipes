output "iap_sa_email" {
  value = google_project_service_identity.iap_sa.email
}

output "invoices_service_sa_email" {
  value = google_service_account.invoices_service.email
}

output "vendors_service_sa_email" {
  value = google_service_account.vendors_service.email
}

output "vendors_management_app_sa_email" {
  value = google_service_account.vendors_management_app.email
}