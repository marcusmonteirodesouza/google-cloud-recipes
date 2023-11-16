import functions_framework
import base64
import json
import logging
import sys
import sendgrid
from sendgrid.helpers.mail import *
from config import config


@functions_framework.cloud_event
def send_email(cloud_event):
    logging.basicConfig(stream=sys.stdout, level=config.log_level)

    cloudevent_message_data = json.loads(
        base64.b64decode(cloud_event.data["message"]["data"]).decode("utf-8")
    )

    logging.info(cloudevent_message_data)

    sg = sendgrid.SendGridAPIClient(api_key=config.sendgrid_api_key)

    from_email = Email(config.sendgrid_from_email)
    to_email = To(cloudevent_message_data["to"])
    subject = cloudevent_message_data["subject"]
    html_content = HtmlContent(cloudevent_message_data["htmlContent"])

    mail = Mail(
        from_email=from_email,
        to_emails=to_email,
        subject=subject,
        html_content=html_content,
    )

    send_email_response = sg.send(message=mail)

    if send_email_response.status_code != 202:
        raise Exception(
            str(
                {
                    "from_email": from_email.email,
                    "to_email": to_email.email,
                    "subject": subject,
                    "html_content": html_content.content,
                    "send_email_response": {
                        "status_code": send_email_response.status_code,
                        "body": send_email_response.body,
                        "headers": send_email_response.headers,
                    },
                }
            )
        )
