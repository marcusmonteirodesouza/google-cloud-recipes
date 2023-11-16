import json
from google.cloud import pubsub
from ..config import config


class EmailClient:
    def __init__(self, publisher: pubsub.PublisherClient):
        self._publisher = publisher

    def send_email(self, to_email: str, subject: str, html_content: str):
        topic_path = self._publisher.topic_path(
            project=config.google_project_id,
            topic=config.google_send_email_pubsub_topic_name,
        )

        data = json.dumps(
            {"to": to_email, "subject": subject, "htmlContent": html_content}
        ).encode("utf-8")

        self._publisher.publish(topic=topic_path, data=data)
