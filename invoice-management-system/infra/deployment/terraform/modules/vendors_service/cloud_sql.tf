resource "random_id" "db_name_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "vendors_service" {
  name             = "vendors-service-${random_id.db_name_suffix.hex}"
  region           = "northamerica-northeast1"
  database_version = "POSTGRES_15"

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = data.google_compute_network.trust.id
      enable_private_path_for_google_cloud_services = true
    }
  }

  encryption_key_name = var.vendors_service_northamerica_northeast1_restricted_crypto_key_id

  timeouts {
    create = "60m"
  }
}

resource "google_sql_database" "vendors_service" {
  name     = "vendors_service"
  instance = google_sql_database_instance.vendors_service.name
}

resource "random_password" "vendors_service_user_password" {
  keepers = {
    name = google_sql_database_instance.vendors_service.name
  }
  min_lower   = 1
  min_numeric = 1
  min_upper   = 1
  length      = 32
  special     = false
}

resource "google_sql_user" "vendors_service" {
  name     = "vendors_service"
  password = random_password.vendors_service_user_password.result
  instance = google_sql_database_instance.vendors_service.name
}

resource "google_secret_manager_secret" "vendors_service_user_password" {
  secret_id = "vendors-service-user-password"

  replication {
    user_managed {
      replicas {
        location = "northamerica-northeast1"

        customer_managed_encryption {
          kms_key_name = var.vendors_service_northamerica_northeast1_restricted_crypto_key_id
        }
      }
    }
  }
}

resource "google_secret_manager_secret_version" "vendors_service_user_password" {
  secret      = google_secret_manager_secret.vendors_service_user_password.id
  secret_data = google_sql_user.vendors_service.password
}

resource "google_secret_manager_secret_iam_member" "vendors_service_user_password_vendors_service_sa" {
  secret_id = google_secret_manager_secret.vendors_service_user_password.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${var.vendors_service_sa_email}"
}