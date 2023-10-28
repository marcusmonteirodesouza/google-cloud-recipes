locals {
  api_directory  = "${path.module}/../../../../../api"
  api_repository = "${google_artifact_registry_repository.api.location}-docker.pkg.dev/${google_artifact_registry_repository.api.project}/${google_artifact_registry_repository.api.name}"
  api_image      = "${local.api_repository}/api"
}

resource "google_artifact_registry_repository" "api" {
  location      = "northamerica-northeast1"
  repository_id = "api-docker-repo"
  format        = "DOCKER"
  kms_key_name  = var.default_confidential_crypto_key_id
}

resource "google_artifact_registry_repository_iam_member" "api_sa" {
  location   = google_artifact_registry_repository.api.location
  repository = google_artifact_registry_repository.api.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${var.api_sa_email}"
}

resource "docker_image" "api" {
  name = local.api_image
  build {
    context = local.api_directory
  }
  triggers = {
    dir_sha1 = sha1(join("", [for f in fileset(local.api_directory, "**") : filesha1("${local.api_directory}/${f}")]))
  }
}

resource "docker_registry_image" "api" {
  name = docker_image.api.name

  triggers = {
    docker_image_repo_digest = docker_image.api.repo_digest
  }
}