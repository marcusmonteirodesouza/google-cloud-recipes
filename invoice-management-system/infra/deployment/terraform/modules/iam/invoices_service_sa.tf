locals {
  invoices_service_sa_roles = [
    "roles/documentai.apiUser",
    "roles/logging.logWriter"
  ]
}

resource "google_service_account" "invoices_service" {
  account_id   = "invoices-service-sa"
  display_name = "invoices Service Service Account"
}

resource "google_project_iam_member" "invoices_service_sa" {
  for_each = toset(local.invoices_service_sa_roles)
  project  = data.google_project.project.project_id
  role     = each.value
  member   = "serviceAccount:${google_service_account.invoices_service.email}"
}