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

provider "acme" {
  # staging
  # server_url = "https://acme-staging-v02.api.letsencrypt.org/directory"
  # production
  server_url = "https://acme-v02.api.letsencrypt.org/directory"
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

  company_name = var.company_name
  environment  = var.environment
}

module "api" {
  source = "./modules/api"

  api_sa_email                       = module.iam.api_sa_email
  default_confidential_crypto_key_id = module.kms.default_confidential_crypto_key_id
}

resource "google_compute_address" "regional_external_application_load_balancer" {
  name         = "regional-external-application-lb-address"
  network_tier = "STANDARD"
  depends_on = [
    module.network
  ]
}

module "regional_external_application_load_balancer" {
  source = "./modules/regional_external_application_load_balancer"

  network_name                = module.network.network_name
#   ssl_certificate             = var.ssl_certificate
#   ssl_certificate_private_key = var.ssl_certificate_private_key
  google_compute_address_id   = google_compute_address.regional_external_application_load_balancer.id
  api_cloud_run_service_name = "hello"
  ssl_certificate = "${acme_certificate.certificate.certificate_pem}"
  ssl_certificate_private_key = "${tls_private_key.cert_private_key.private_key_pem}"
#   ssl_certificate_private_key = "${acme_certificate.certificate.private_key_pem}"
#   api_cloud_run_service_name  = module.api.api_cloud_run_service_name
  depends_on = [
    acme_certificate.certificate,
    module.network
  ]
}