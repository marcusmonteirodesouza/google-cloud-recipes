locals {
  authorize_gmail_access_service_sa_roles = [
    "roles/logging.logWriter"
  ]
}

resource "google_service_account" "authorize_gmail_access_service" {
  account_id   = "authorize-gmail-access-srvc-sa"
  display_name = "Authorize Gmail Access Cloud Function Service Service Account"
}

resource "google_project_iam_member" "authorize_gmail_access_service_sa" {
  for_each = toset(local.authorize_gmail_access_service_sa_roles)
  project  = data.google_project.project.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.authorize_gmail_access_service.email}"
}