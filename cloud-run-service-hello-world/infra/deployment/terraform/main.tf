provider "google" {
  project               = var.project_id
  region                = "northamerica-northeast1"
  billing_project       = var.project_id
  user_project_override = true
}

provider "google-beta" {
  project               = var.project_id
  region                = "northamerica-northeast1"
  billing_project       = var.project_id
  user_project_override = true
}

provider "docker" {
  registry_auth {
    address  = "northamerica-northeast1-docker.pkg.dev"
    username = "oauth2accesstoken"
    password = data.google_client_config.default.access_token
  }
}

data "google_client_config" "default" {
}

module "enable_apis" {
  source = "./modules/enable_apis"
}

module "kms" {
  source = "./modules/kms"

  depends_on = [
    module.enable_apis
  ]
}

module "iam" {
  source = "./modules/iam"

  default_confidential_crypto_key_id = module.kms.default_confidential_crypto_key_id
}

module "network" {
  source = "./modules/network"

  environment = var.environment
}

module "api" {
  source = "./modules/api"

  api_sa_email                       = module.iam.api_sa_email
  default_confidential_crypto_key_id = module.kms.default_confidential_crypto_key_id
}

resource "google_compute_address" "regional_http_load_balancer" {
  name         = "regional-http-load-balancer-address"
  network_tier = "STANDARD"
}

module "regional_http_load_balancer" {
  source = "./modules/regional_http_load_balancer"

  network_name                = module.network.network_name
  ssl_certificate             = var.ssl_certificate
  ssl_certificate_private_key = var.ssl_certificate_private_key
  google_compute_address_id   = google_compute_address.regional_http_load_balancer.id
  api_cloud_run_service_name  = module.api.api_cloud_run_service_name
}