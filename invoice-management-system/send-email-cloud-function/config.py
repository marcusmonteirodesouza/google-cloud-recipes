import os


class _Config:
    log_level = os.environ["LOG_LEVEL"]
    sendgrid_api_key = os.environ["SENDGRID_API_KEY"]
    sendgrid_from_email = os.environ["SENDGRID_FROM_EMAIL"]


config = _Config()
