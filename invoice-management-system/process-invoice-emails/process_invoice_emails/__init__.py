import poplib
import email
import re
import os.path
from .vendors import VendorsClient, ErrorResponse
from .config import config


def main():
    vendors_client = VendorsClient(base_url=config.vendors_service_base_url)

    pop3_client = poplib.POP3_SSL(host="pop.gmail.com")
    pop3_client.user(user=config.gmail_address)
    pop3_client.pass_(pswd=config.gmail_app_password)

    try:
        inbox_listing = pop3_client.list()
        number_of_inbox_messages = len(inbox_listing[1])
        for i in range(number_of_inbox_messages):
            retr_inbox_message = pop3_client.retr(which=i + 1)
            retr_inbox_message_raw = b"\n".join(retr_inbox_message[1])
            retr_inbox_message_parsed = email.message_from_bytes(retr_inbox_message_raw)

            vendor_email = re.search(
                "<(.+?)>", retr_inbox_message_parsed["From"]
            ).group(1)

            list_vendors_response = vendors_client.list_vendors(email=vendor_email)

            if isinstance(list_vendors_response, ErrorResponse):
                print(list_vendors_response)
                raise Exception(list_vendors_response.message)

            if len(list_vendors_response) == 1:
                vendor = list_vendors_response[0]

                for part in retr_inbox_message_parsed.walk():
                    invoice_filename = part.get_filename()
                    if invoice_filename:
                        invoice_filepath = os.path.join(
                            os.path.curdir, "invoice_sample.pdf"
                        )
                        with open(invoice_filepath, mode="wb") as f:
                            f.write(part.get_payload(decode=True))
            else:
                raise ValueError(
                    f"More than one vendor with email {vendor_email} was found"
                )
    finally:
        pop3_client.quit()
