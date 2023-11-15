locals {
  vendors_service_directory  = "${path.module}/../../../../../vendors-service"
  vendors_service_repository = "${google_artifact_registry_repository.vendors_service.location}-docker.pkg.dev/${google_artifact_registry_repository.vendors_service.project}/${google_artifact_registry_repository.vendors_service.name}"
  vendors_service_image      = "${local.vendors_service_repository}/vendors-service"
}

resource "google_artifact_registry_repository" "vendors_service" {
  location      = "northamerica-northeast1"
  repository_id = "vendors-service-docker-repo"
  format        = "DOCKER"
  kms_key_name  = var.vendors_service_northamerica_northeast1_confidential_crypto_key_id
}

resource "docker_image" "vendors_service" {
  name = local.vendors_service_image
  build {
    context = local.vendors_service_directory
  }
  triggers = {
    dir_sha1 = sha1(join("", [for f in fileset(local.vendors_service_directory, "**") : filesha1("${local.vendors_service_directory}/${f}")]))
  }
}

resource "docker_registry_image" "vendors_service" {
  name = docker_image.vendors_service.name

  triggers = {
    docker_image_repo_digest = docker_image.vendors_service.repo_digest
  }
}

resource "google_artifact_registry_repository_iam_member" "vendors_service_repository_vendors_service_sa" {
  location   = google_artifact_registry_repository.vendors_service.location
  repository = google_artifact_registry_repository.vendors_service.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${var.vendors_service_sa_email}"
}