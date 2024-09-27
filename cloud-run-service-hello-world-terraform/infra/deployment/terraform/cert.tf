resource "tls_private_key" "reg_private_key" {
  algorithm = "RSA"
}

resource "acme_registration" "reg" {
  account_key_pem = tls_private_key.reg_private_key.private_key_pem
  email_address   = "vishal.patel@yoppworks.com"
}

resource "tls_private_key" "cert_private_key" {
  algorithm = "RSA"
}

resource "tls_cert_request" "req" {
#   key_algorithm   = "RSA"
  private_key_pem = tls_private_key.cert_private_key.private_key_pem
  subject {
    common_name = "*.gcp.yoppworks.com"
    organization = var.company_name
  }
}

resource "acme_certificate" "certificate" {
  account_key_pem           = acme_registration.reg.account_key_pem
  certificate_request_pem   = tls_cert_request.req.cert_request_pem
  pre_check_delay = "120"
  disable_complete_propagation = true

  dns_challenge {
    provider = "gcloud"
    config = {
    #   GCE_SERVICE_ACCOUNT_FILE = "service_account.json"
      GCE_PROJECT              = "dns-delegation-404617"
    #   GCE_POLLING_INTERVAL = 120
    #   GCE_PROPAGATION_TIMEOUT = 120
    }
  }
}
