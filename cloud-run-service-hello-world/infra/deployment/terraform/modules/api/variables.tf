variable "default_northamerica_northeast1_confidential_crypto_key_id" {
  type        = string
  description = "The default northamerica-northeast1 confidential KMS crypto key ID."
}

variable "api_sa_email" {
  type        = string
  description = "The API Service Account email."
}

variable "api_cloud_run_services_configs" {
  type = object({
    northamerica-northeast1 = object({
      kms_crypto_key_id = string
    })
    northamerica-northeast2 = object({
      kms_crypto_key_id = string
    })
  })

  description = "The API Cloud Run Services configuration."
}