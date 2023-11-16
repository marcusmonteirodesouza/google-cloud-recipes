import poplib
import email
import re
import logging
from ..invoices import (
    Invoice,
    InvoicesClient,
    ErrorResponse as InvoicesClientErrorResponse,
)
from ..vendors import Vendor, VendorsClient, ErrorResponse as VendorsClientErrorResponse
from ..email_client import EmailClient


class InvoiceEmailsProcessor:
    def __init__(
        self,
        pop3_client: poplib.POP3_SSL,
        invoices_client: InvoicesClient,
        vendors_client: VendorsClient,
        email_client: EmailClient,
    ):
        self._pop3_client = pop3_client
        self._invoices_client = invoices_client
        self._vendors_client = vendors_client
        self._email_client = email_client

    def process_invoice_emails(self):
        inbox_listing = self._pop3_client.list()
        number_of_inbox_messages = len(inbox_listing[1])

        logging.info(f"Number of inbox messages {number_of_inbox_messages}")

        for i in range(number_of_inbox_messages):
            retr_inbox_message = self._pop3_client.retr(which=i + 1)
            retr_inbox_message_raw = b"\n".join(retr_inbox_message[1])
            retr_inbox_message_parsed = email.message_from_bytes(retr_inbox_message_raw)

            vendor_email = (
                re.search("<(.+?)>", retr_inbox_message_parsed["From"]).group(1).strip()
            )

            logging.info(f"Processing message from vendor {vendor_email}")

            list_vendors_response = self._vendors_client.list_vendors(
                email=vendor_email
            )

            if isinstance(list_vendors_response, VendorsClientErrorResponse):
                raise Exception(list_vendors_response)

            if len(list_vendors_response) == 0:
                logging.warning(f"Vendor {vendor_email} not found. Skipping it")
            elif len(list_vendors_response) == 1:
                logging.info(
                    f"Vendor {vendor_email} found. Retrieving invoice attachment"
                )

                vendor = list_vendors_response[0]

                for part in retr_inbox_message_parsed.walk():
                    invoice_filename = part.get_filename()
                    if invoice_filename:
                        logging.info(
                            f"Found invoice attachment for vendor {vendor.email}. Filename {invoice_filename}"
                        )

                        invoice_content = part.get_payload(decode=True)

                        create_invoice_response = self._invoices_client.create_invoice(
                            vendor_id=vendor.id
                        )

                        if isinstance(
                            create_invoice_response, InvoicesClientErrorResponse
                        ):
                            raise Exception(create_invoice_response)

                        created_invoice = create_invoice_response

                        logging.info(f"Invoice created {created_invoice}")

                        logging.info(f"Uploading file for invoice {created_invoice.id}")

                        upload_invoice_response = self._invoices_client.upload_invoice(
                            invoice_id=created_invoice.id, file_content=invoice_content
                        )

                        if isinstance(
                            upload_invoice_response, InvoicesClientErrorResponse
                        ):
                            raise Exception(upload_invoice_response)

                        invoice_after_file_upload = upload_invoice_response

                        logging.info(
                            f"File for invoice {invoice_after_file_upload.id} uploaded successfully"
                        )

                        self._send_invoice_received_email(
                            vendor=vendor, invoice=invoice_after_file_upload
                        )
            else:
                raise ValueError(
                    f"More than one vendor with email {vendor_email} was found"
                )

    def _send_invoice_received_email(self, vendor: Vendor, invoice: Invoice):
        html_content_total_amount = (
            f"for <strong>{invoice.currency}{invoice.total_amount}</strong>"
            if invoice.currency is not None and invoice.total_amount is not None
            else ""
        )
        html_content_due_date = (
            f"with due date <strong>{invoice.due_date.date()}</strong>"
            if invoice.due_date is not None
            else ""
        )

        html_content = f"""
            <p>Hello, {vendor.name},</p>
            <p>Your invoice {html_content_total_amount} {html_content_due_date} was received and is currently being processed. The invoice ID is <strong>{invoice.id}</strong>.</p>
            <p>We will send you another email when the processing is completed.
            <p>Kind regards,</p>
            <p>The Invoice Management System team</p>
        """.replace(
            "  ", " "
        )

        self._email_client.send_email(
            to_email=vendor.email,
            subject=f"Invoice Management System - Invoice {invoice.id}",
            html_content=html_content,
        )
