locals {
  vendors_management_app_directory  = "${path.module}/../../../../../vendors-management-app"
  vendors_management_app_repository = "${google_artifact_registry_repository.vendors_management_app.location}-docker.pkg.dev/${google_artifact_registry_repository.vendors_management_app.project}/${google_artifact_registry_repository.vendors_management_app.name}"
  vendors_management_app_image      = "${local.vendors_management_app_repository}/vendors-management-app"
}

resource "google_artifact_registry_repository" "vendors_management_app" {
  location      = "northamerica-northeast1"
  repository_id = "vendors-management-app-docker-repo"
  format        = "DOCKER"
  kms_key_name  = var.vendors_management_app_northamerica_northeast1_confidential_crypto_key_id
}

resource "docker_image" "vendors_management_app" {
  name = local.vendors_management_app_image
  build {
    context = local.vendors_management_app_directory
  }
  triggers = {
    dir_sha1 = sha1(join("", [for f in fileset(local.vendors_management_app_directory, "**") : filesha1("${local.vendors_management_app_directory}/${f}")]))
  }
}

resource "docker_registry_image" "vendors_management_app" {
  name = docker_image.vendors_management_app.name

  triggers = {
    docker_image_repo_digest = docker_image.vendors_management_app.repo_digest
  }
}

resource "google_artifact_registry_repository_iam_member" "vendors_management_app_repository_vendors_management_app_sa" {
  location   = google_artifact_registry_repository.vendors_management_app.location
  repository = google_artifact_registry_repository.vendors_management_app.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${var.vendors_management_app_sa_email}"
}