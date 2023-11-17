locals {
  enable_apis = [
    "addressvalidation.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudasset.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudkms.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "cloudscheduler.googleapis.com",
    "compute.googleapis.com",
    "containeranalysis.googleapis.com",
    "contentwarehouse.googleapis.com",
    "documentai.googleapis.com",
    "gmail.googleapis.com",
    "iam.googleapis.com",
    "iap.googleapis.com",
    "monitoring.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
    "vpcaccess.googleapis.com"
  ]
}

resource "google_project_service" "enable_apis" {
  for_each                   = toset(local.enable_apis)
  service                    = each.value
  disable_dependent_services = true
  disable_on_destroy         = true
}