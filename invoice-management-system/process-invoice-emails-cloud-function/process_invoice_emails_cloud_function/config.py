import os


class _Config:
    gmail_address = os.environ["GMAIL_ADDRESS"]
    gmail_app_password = os.environ["GMAIL_APP_PASSWORD"]
    google_project_id = os.environ["GOOGLE_PROJECT_ID"]
    google_send_email_pubsub_topic_name = os.environ[
        "GOOGLE_SEND_EMAIL_PUBSUB_TOPIC_NAME"
    ]
    log_level = os.environ["LOG_LEVEL"]
    invoices_service_base_url = os.environ["INVOICES_SERVICE_BASE_URL"]
    vendors_service_base_url = os.environ["VENDORS_SERVICE_BASE_URL"]


config = _Config()
