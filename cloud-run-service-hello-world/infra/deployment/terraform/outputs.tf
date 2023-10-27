output "global_http_load_balancer_ip_address" {
  value = local.global_http_load_balancer_ip_address
}

output "global_http_load_balancer_ssl_certificate_name" {
  value = module.global_http_load_balancer.ssl_certificate_name
}

output "terraform_tfstate_bucket" {
  value = google_storage_bucket.tfstate.name
}

output "terraform_tfvars_secret" {
  value = google_secret_manager_secret.terraform_tfvars.name
}