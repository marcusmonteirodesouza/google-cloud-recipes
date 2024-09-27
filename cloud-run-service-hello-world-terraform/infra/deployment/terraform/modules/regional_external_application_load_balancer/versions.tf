terraform {
  required_providers {
    google = {
      version = "5.4.0"
      source  = "hashicorp/google"
    }
    random = {
      source = "hashicorp/random"
      version = "3.5.1"
    }
  }
}