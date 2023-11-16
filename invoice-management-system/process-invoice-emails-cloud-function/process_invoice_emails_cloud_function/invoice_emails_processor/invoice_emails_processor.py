import poplib
import email
import re
import logging
from ..invoices import InvoicesClient, ErrorResponse as InvoicesClientErrorResponse
from ..vendors import VendorsClient, ErrorResponse as VendorsClientErrorResponse


class InvoiceEmailsProcessor:
    def __init__(
        self,
        pop3_client: poplib.POP3_SSL,
        invoices_client: InvoicesClient,
        vendors_client: VendorsClient,
    ):
        self._pop3_client = pop3_client
        self._invoices_client = invoices_client
        self._vendors_client = vendors_client

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
                            f"Invoice attachment for vendor {vendor.email} found. Filename {invoice_filename}"
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

                        uploaded_file_invoice = upload_invoice_response

                        logging.info(
                            f"File for invoice {uploaded_file_invoice.id} uploaded successfully"
                        )
            else:
                raise ValueError(
                    f"More than one vendor with email {vendor_email} was found"
                )
