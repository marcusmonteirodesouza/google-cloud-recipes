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

  bootstrap_northamerica_northeast1_confidential_crypto_key_id                             = module.kms.bootstrap_northamerica_northeast1_confidential_crypto_key_id
  invoices_service_northamerica_northeast1_confidential_crypto_key_id                      = module.kms.invoices_service_northamerica_northeast1_confidential_crypto_key_id
  invoices_service_northamerica_northeast1_restricted_crypto_key_id                        = module.kms.invoices_service_northamerica_northeast1_restricted_crypto_key_id
  invoices_service_us_central1_restricted_crypto_key_id                                    = module.kms.invoices_service_us_central1_restricted_crypto_key_id
  vendors_management_app_northamerica_northeast1_confidential_crypto_key_id                = module.kms.vendors_management_app_northamerica_northeast1_confidential_crypto_key_id
  vendors_service_northamerica_northeast1_confidential_crypto_key_id                       = module.kms.vendors_service_northamerica_northeast1_confidential_crypto_key_id
  vendors_service_northamerica_northeast1_restricted_crypto_key_id                         = module.kms.invoices_service_northamerica_northeast1_restricted_crypto_key_id
  process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id = module.kms.process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id
  process_invoice_emails_cloud_function_northamerica_northeast1_restricted_crypto_key_id   = module.kms.process_invoice_emails_cloud_function_northamerica_northeast1_restricted_crypto_key_id
}

module "network" {
  source = "./modules/network"

  company_name = var.company_name
  environment  = var.environment
}

module "vendors_service" {
  source = "./modules/vendors_service"

  trust_network_name                                                 = module.network.trust_network_name
  trust_vpc_access_connector_northamerica_northeast1_id              = module.network.trust_vpc_access_connector_northamerica_northeast1_id
  vendors_service_sa_email                                           = module.iam.vendors_service_sa_email
  vendors_service_northamerica_northeast1_confidential_crypto_key_id = module.kms.invoices_service_northamerica_northeast1_confidential_crypto_key_id
  vendors_service_northamerica_northeast1_restricted_crypto_key_id   = module.kms.invoices_service_northamerica_northeast1_restricted_crypto_key_id
}

module "invoices_service" {
  source = "./modules/invoices_service"

  trust_network_name                                                  = module.network.trust_network_name
  trust_vpc_access_connector_northamerica_northeast1_id               = module.network.trust_vpc_access_connector_northamerica_northeast1_id
  invoices_service_sa_email                                           = module.iam.invoices_service_sa_email
  invoices_service_northamerica_northeast1_confidential_crypto_key_id = module.kms.invoices_service_northamerica_northeast1_confidential_crypto_key_id
  invoices_service_northamerica_northeast1_restricted_crypto_key_id   = module.kms.invoices_service_northamerica_northeast1_restricted_crypto_key_id
  invoices_service_us_central1_restricted_crypto_key_id               = module.kms.invoices_service_us_central1_restricted_crypto_key_id
  vendors_service_name                                                = module.vendors_service.name
}

module "vendors_management_app" {
  source = "./modules/vendors_management_app"

  trust_vpc_access_connector_northamerica_northeast1_id                     = module.network.trust_vpc_access_connector_northamerica_northeast1_id
  iap_sa_email                                                              = module.iam.iap_sa_email
  vendors_management_app_sa_email                                           = module.iam.vendors_management_app_sa_email
  vendors_management_app_users_group                                        = var.vendors_management_app_users_group
  vendors_management_app_northamerica_northeast1_confidential_crypto_key_id = module.kms.vendors_management_app_northamerica_northeast1_confidential_crypto_key_id
  vendors_service_name                                                      = module.vendors_service.name
}

module "process_invoice_emails_cloud_function" {
  source = "./modules/process_invoice_emails_cloud_function"

  trust_vpc_access_connector_northamerica_northeast1_id                                    = module.network.trust_vpc_access_connector_northamerica_northeast1_id
  process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id = module.kms.process_invoice_emails_cloud_function_northamerica_northeast1_confidential_crypto_key_id
  process_invoice_emails_cloud_function_northamerica_northeast1_restricted_crypto_key_id   = module.kms.process_invoice_emails_cloud_function_northamerica_northeast1_restricted_crypto_key_id
  process_invoice_emails_cloud_function_sa_email                                           = module.iam.process_invoice_emails_cloud_function_sa_email
  gmail_address                                                                            = var.process_invoice_emails_gmail_address
  gmail_app_password                                                                       = var.process_invoice_emails_gmail_app_password
  invoices_service_name                                                                    = module.invoices_service.name
  vendors_service_name                                                                     = module.vendors_service.name
}

resource "google_compute_address" "load_balancer" {
  name         = "invoice-management-system-lb-address"
  network_tier = "STANDARD"
}

module "load_balancer" {
  source = "./modules/load_balancer"

  trust_network_name                            = module.network.trust_network_name
  google_compute_address_id                     = google_compute_address.load_balancer.id
  ssl_certificate                               = var.ssl_certificate
  ssl_certificate_private_key                   = var.ssl_certificate_private_key
  oauth2_client_id                              = var.oauth2_client_id
  oauth2_client_secret                          = var.oauth2_client_secret
  vendors_management_app_sa_email               = module.iam.vendors_management_app_sa_email
  vendors_management_app_users_group            = var.vendors_management_app_users_group
  vendors_management_app_domain                 = var.vendors_management_app_domain
  vendors_management_app_cloud_run_service_name = module.vendors_management_app.name
  vendors_management_app_backend_service_name   = module.vendors_management_app.backend_service_name
}