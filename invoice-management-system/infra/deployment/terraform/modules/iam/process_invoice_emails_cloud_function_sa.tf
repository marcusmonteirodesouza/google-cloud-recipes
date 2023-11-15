locals {
  process_invoice_emails_app_sa_roles = [
    "roles/logging.logWriter"
  ]
}

resource "google_service_account" "process_invoice_emails_cloud_function_sa" {
  account_id   = "process-invoice-emails-cf-sa"
  display_name = "Process Invoice Emails Cloud Function Service Account"
}

resource "google_project_iam_member" "process_invoice_emails_cloud_function_sa" {
  for_each = toset(local.process_invoice_emails_app_sa_roles)
  project  = data.google_project.project.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.process_invoice_emails_cloud_function_sa.email}"
}