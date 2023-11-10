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

  company_name = var.company_name
  environment  = var.environment
}

module "vendors_service" {
  source = "./modules/vendors_service"

  default_confidential_crypto_key_id                    = module.kms.default_confidential_crypto_key_id
  trust_network_name                                    = module.network.trust_network_name
  trust_vpc_access_connector_northamerica_northeast1_id = module.network.trust_vpc_access_connector_northamerica_northeast1_id
  vendors_service_sa_email                              = module.iam.vendors_service_sa_email
}

module "vendors_management_app" {
  source = "./modules/vendors_management_app"

  default_confidential_crypto_key_id                    = module.kms.default_confidential_crypto_key_id
  iap_sa_email                                          = module.iam.iap_sa_email
  vendors_management_app_sa_email                       = module.iam.vendors_management_app_sa_email
  vendors_management_app_users_group                    = var.vendors_management_app_users_group
  vendors_management_app_support_email                  = var.vendors_management_app_support_email
  trust_vpc_access_connector_northamerica_northeast1_id = module.network.trust_vpc_access_connector_northamerica_northeast1_id
  vendors_service_name                                  = module.vendors_service.name
}

resource "google_compute_address" "load_balancer" {
  name         = "invoice-management-system-lb-address"
  network_tier = "STANDARD"
}

module "load_balancer" {
  source = "./modules/load_balancer"

  default_confidential_crypto_key_id            = module.kms.default_confidential_crypto_key_id
  trust_network_name                            = module.network.trust_network_name
  vendors_management_app_cloud_run_service_name = module.vendors_management_app.name
  vendors_management_app_backend_service_name   = module.vendors_management_app.backend_service_name
  vendors_management_app_iap_client_id          = module.vendors_management_app.iap_client_id
  vendors_management_app_iap_client_secret      = module.vendors_management_app.iap_client_secret
  vendors_management_app_sa_email               = module.iam.vendors_management_app_sa_email
  vendors_management_app_users_group            = var.vendors_management_app_users_group
  ssl_certificate                               = var.ssl_certificate
  ssl_certificate_private_key                   = var.ssl_certificate_private_key
  google_compute_address_id                     = google_compute_address.load_balancer.id
}