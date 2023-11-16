import poplib
import logging
import sys
from google.cloud import pubsub
from .vendors import VendorsClient, ErrorResponse as VendorsClientErrorResponse
from .invoices import InvoicesClient, ErrorResponse as InvoicesClientErrorResponse
from .email_client import EmailClient
from .invoice_emails_processor import InvoiceEmailsProcessor
from .config import config


def main():
    logging.basicConfig(stream=sys.stdout, level=config.log_level)

    logging.info("Processing Invoice Emails - START")

    pop3_client = poplib.POP3_SSL(host="pop.gmail.com")
    pop3_client.user(user=config.gmail_address)
    pop3_client.pass_(pswd=config.gmail_app_password)

    invoices_client = InvoicesClient(base_url=config.invoices_service_base_url)
    vendors_client = VendorsClient(base_url=config.vendors_service_base_url)
    publisher = pubsub.PublisherClient()
    email_clnt = EmailClient(publisher=publisher)

    invoice_emails_proc = InvoiceEmailsProcessor(
        pop3_client=pop3_client,
        invoices_client=invoices_client,
        vendors_client=vendors_client,
        email_client=email_clnt,
    )

    try:
        invoice_emails_proc.process_invoice_emails()
    finally:
        pop3_client.quit()

    logging.info("Processing Invoice Emails - END")
