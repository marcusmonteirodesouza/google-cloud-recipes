import datetime
import requests
import tempfile
from decimal import Decimal
from typing import Any, Union
from .invoice import Invoice
from .invoice_status import InvoiceStatus
from .error_response import ErrorResponse


class InvoicesClient:
    def __init__(self, base_url: str):
        self._invoices_service_base_url = base_url

    def create_invoice(self, file_content: Any) -> Union[Invoice, ErrorResponse]:
        with tempfile.NamedTemporaryFile(delete_on_close=False) as fp:
            fp.write(file_content)
            fp.close()
            with open(fp.name, mode="rb") as f:
                upload_invoice_response = requests.post(
                    self._invoices_service_base_url,
                    files={"file": ("invoice.pdf", f, "application/pdf")},
                    headers={"Accept": "application/json"},
                )

        upload_invoice_response_json = upload_invoice_response.json()

        if upload_invoice_response.status_code != 201:
            return ErrorResponse(
                code=upload_invoice_response_json["error"]["code"],
                message=upload_invoice_response_json["error"]["message"],
            )

        return self._from_invoice_response_json(
            invoice_response_json=upload_invoice_response_json
        )

    @staticmethod
    def _from_invoice_response_json(invoice_response_json: Any) -> Invoice:
        return Invoice(
            _id=invoice_response_json["id"],
            vendor_id=invoice_response_json["vendorId"],
            vendor_invoice_id=invoice_response_json["vendorInvoiceId"],
            vendor_address=invoice_response_json["vendorAddress"],
            vendor_google_place_id=invoice_response_json["vendorGooglePlaceId"],
            status=InvoiceStatus.from_str(invoice_response_json["status"]),
            date=datetime.datetime.fromisoformat(invoice_response_json["date"])
            if invoice_response_json["date"] is not None
            else None,
            due_date=datetime.datetime.fromisoformat(invoice_response_json["dueDate"])
            if invoice_response_json["dueDate"] is not None
            else None,
            net_amount=Decimal(invoice_response_json["netAmount"])
            if invoice_response_json["netAmount"] is not None
            else None,
            total_tax_amount=Decimal(invoice_response_json["totalTaxAmount"])
            if invoice_response_json["totalTaxAmount"] is not None
            else None,
            total_amount=Decimal(invoice_response_json["totalAmount"])
            if invoice_response_json["totalAmount"] is not None
            else None,
            currency=invoice_response_json["currency"],
            created_at=datetime.datetime.fromisoformat(
                invoice_response_json["createdAt"]
            ),
            updated_at=datetime.datetime.fromisoformat(
                invoice_response_json["updatedAt"]
            ),
        )
