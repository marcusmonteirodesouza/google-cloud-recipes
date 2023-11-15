import os


class _Config:
    gmail_address = os.environ["GMAIL_ADDRESS"]
    gmail_app_password = os.environ["GMAIL_APP_PASSWORD"]
    log_level = os.environ["LOG_LEVEL"]
    invoices_service_base_url = os.environ["INVOICES_SERVICE_BASE_URL"]
    vendors_service_base_url = os.environ["VENDORS_SERVICE_BASE_URL"]


config = _Config()
