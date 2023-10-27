locals {
  global_http_load_balancer_ip_address = join("", google_compute_global_address.global_http_load_balancer.*.address)
}

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

  default_northamerica_northeast1_confidential_crypto_key_id = module.kms.default_northamerica_northeast1_confidential_crypto_key_id
  default_northamerica_northeast2_confidential_crypto_key_id = module.kms.default_northamerica_northeast2_confidential_crypto_key_id
}

module "api" {
  source = "./modules/api"

  default_northamerica_northeast1_confidential_crypto_key_id = module.kms.default_northamerica_northeast1_confidential_crypto_key_id
  api_sa_email                                               = module.iam.api_sa_email
  api_cloud_run_services_configs = {
    northamerica-northeast1 = {
      kms_crypto_key_id = module.kms.default_northamerica_northeast1_confidential_crypto_key_id
    }
    northamerica-northeast2 = {
      kms_crypto_key_id = module.kms.default_northamerica_northeast2_confidential_crypto_key_id
    }
  }
}

resource "google_compute_global_address" "global_http_load_balancer" {
  name = "global-http-load-balancer-address"
}

module "global_http_load_balancer" {
  source = "./modules/global_http_load_balancer"

  domain_names = var.domain_names
  ip_address   = local.global_http_load_balancer_ip_address
  api_cloud_run_services_names = {
    northamerica-northeast1 = {
      name = module.api.api_cloud_run_services_names.northamerica-northeast1.name
    }
    northamerica-northeast2 = {
      name = module.api.api_cloud_run_services_names.northamerica-northeast2.name
    }
  }
}