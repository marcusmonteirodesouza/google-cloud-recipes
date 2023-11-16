locals {
  send_email_app_sa_roles = [
    "roles/logging.logWriter"
  ]
}

resource "google_service_account" "send_email_cloud_function_sa" {
  account_id   = "send-email-cf-sa"
  display_name = "Send Email Cloud Function Service Account"
}

resource "google_project_iam_member" "send_email_cloud_function_sa" {
  for_each = toset(local.send_email_app_sa_roles)
  project  = data.google_project.project.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.send_email_cloud_function_sa.email}"
}