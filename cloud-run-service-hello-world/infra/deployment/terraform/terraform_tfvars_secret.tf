resource "google_secret_manager_secret" "terraform_tfvars" {
  secret_id = "terraform-tfvars"

  replication {
    user_managed {
      replicas {
        location = "northamerica-northeast1"

        customer_managed_encryption {
          kms_key_name = module.kms.default_confidential_crypto_key_id
        }
      }
    }
  }

  depends_on = [
    module.iam
  ]
}

resource "google_secret_manager_secret_version" "terraform_tfvars" {
  secret      = google_secret_manager_secret.terraform_tfvars.id
  secret_data = file("${path.module}/terraform.tfvars")
}