locals {
  invoices_service_directory  = "${path.module}/../../../../../invoices-service"
  invoices_service_repository = "${google_artifact_registry_repository.invoices_service.location}-docker.pkg.dev/${google_artifact_registry_repository.invoices_service.project}/${google_artifact_registry_repository.invoices_service.name}"
  invoices_service_image      = "${local.invoices_service_repository}/invoices-service"
}

resource "google_artifact_registry_repository" "invoices_service" {
  location      = "northamerica-northeast1"
  repository_id = "invoices-service-docker-repo"
  format        = "DOCKER"
  kms_key_name  = var.default_confidential_crypto_key_id
}

resource "docker_image" "invoices_service" {
  name = local.invoices_service_image
  build {
    context = local.invoices_service_directory
  }
  triggers = {
    dir_sha1 = sha1(join("", [for f in fileset(local.invoices_service_directory, "**") : filesha1("${local.invoices_service_directory}/${f}")]))
  }
}

resource "docker_registry_image" "invoices_service" {
  name = docker_image.invoices_service.name

  triggers = {
    docker_image_repo_digest = docker_image.invoices_service.repo_digest
  }
}