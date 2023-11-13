locals {
  authorize_gmail_access_service_directory  = "${path.module}/../../../../../authorize-gmail-access-service"
  authorize_gmail_access_service_repository = "${google_artifact_registry_repository.authorize_gmail_access_service.location}-docker.pkg.dev/${google_artifact_registry_repository.authorize_gmail_access_service.project}/${google_artifact_registry_repository.authorize_gmail_access_service.name}"
  authorize_gmail_access_service_image      = "${local.authorize_gmail_access_service_repository}/authorize-gmail-access-service"
}

resource "google_artifact_registry_repository" "authorize_gmail_access_service" {
  location      = "northamerica-northeast1"
  repository_id = "authorize-gmail-access-service-docker-repo"
  format        = "DOCKER"
  kms_key_name  = var.default_confidential_crypto_key_id
}

resource "docker_image" "authorize_gmail_access_service" {
  name = local.authorize_gmail_access_service_image
  build {
    context = local.authorize_gmail_access_service_directory
  }
  triggers = {
    dir_sha1 = sha1(join("", [for f in fileset(local.authorize_gmail_access_service_directory, "**") : filesha1("${local.authorize_gmail_access_service_directory}/${f}")]))
  }
}

resource "docker_registry_image" "authorize_gmail_access_service" {
  name = docker_image.authorize_gmail_access_service.name

  triggers = {
    docker_image_repo_digest = docker_image.authorize_gmail_access_service.repo_digest
  }
}