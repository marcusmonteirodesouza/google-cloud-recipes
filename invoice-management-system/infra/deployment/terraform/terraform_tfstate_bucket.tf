resource "random_uuid" "tfstate_bucket" {
}

resource "google_storage_bucket" "tfstate" {
  name     = random_uuid.tfstate_bucket.result
  location = "northamerica-northeast1"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  encryption {
    default_kms_key_name = module.kms.bootstrap_northamerica_northeast1_confidential_crypto_key_id
  }

  depends_on = [
    module.iam
  ]
}