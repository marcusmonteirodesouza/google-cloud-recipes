import datetime
import json
from decimal import Decimal
from typing import Optional
from .invoice_status import InvoiceStatus


class Invoice:
    def __init__(
        self,
        _id: str,
        status: InvoiceStatus,
        vendor_id: str,
        vendor_invoice_id: str,
        vendor_address: Optional[str],
        vendor_google_place_id: Optional[str],
        date: Optional[datetime.datetime],
        due_date: Optional[datetime.datetime],
        net_amount: Optional[Decimal],
        total_tax_amount: Optional[Decimal],
        total_amount: Optional[Decimal],
        currency: Optional[str],
        created_at: datetime.datetime,
        updated_at: datetime.datetime,
    ):
        self._id = _id
        self.vendor_id = vendor_id
        self.vendor_invoice_id = vendor_invoice_id
        self.vendor_address = vendor_address
        self.vendor_google_place_id = vendor_google_place_id
        self.status = status
        self.date = date
        self.due_date = due_date
        self.net_amount = net_amount
        self.total_tax_amount = total_tax_amount
        self.total_amount = total_amount
        self.currency = currency
        self.created_at = created_at
        self.updated_at = updated_at

    @property
    def id(self):
        return self._id

    def __repr__(self):
        return json.dumps(
            {
                "id": self.id,
                "status": self.status,
                "vendor_id": self.vendor_id,
                "vendor_invoice_id": self.vendor_invoice_id,
                "vendor_address": self.vendor_address,
                "vendor_google_place_id": self.vendor_google_place_id,
                "date": self.date.isoformat() if self.date is not None else None,
                "due_date": self.due_date.isoformat()
                if self.date is not None
                else None,
                "net_amount": self.net_amount,
                "total_tax_amount": self.total_tax_amount,
                "total_amount": self.total_amount,
                "currency": self.currency,
                "created_at": self.created_at.isoformat(),
                "updated_at": self.updated_at.isoformat(),
            }
        )
