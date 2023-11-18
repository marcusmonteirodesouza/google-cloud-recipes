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

output "send_email_cloud_function_sa_email" {
  value = google_service_account.send_email_cloud_function_sa.email
}

output "process_invoice_emails_cloud_function_sa_email" {
  value = google_service_account.process_invoice_emails_cloud_function_sa.email
}