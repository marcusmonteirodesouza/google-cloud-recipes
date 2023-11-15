import datetime
import requests
from typing import Union
from .vendor import Vendor
from .error_response import ErrorResponse


class VendorsClient:
    def __init__(self, base_url: str):
        self._vendors_service_base_url = base_url

    def list_vendors(self, email=None) -> Union[list[Vendor], ErrorResponse]:
        params = {}

        if email is not None:
            params["email"] = email

        list_vendors_response = requests.get(
            self._vendors_service_base_url,
            params=params,
            headers={"Accept": "application/json"},
        )

        list_vendors_response_json = list_vendors_response.json()

        if list_vendors_response.status_code != 200:
            return ErrorResponse(
                code=list_vendors_response_json["error"]["code"],
                message=list_vendors_response_json["error"]["message"],
            )

        vendors = []

        for vendor in list_vendors_response_json:
            vendors.append(
                Vendor(
                    _id=vendor["id"],
                    name=vendor["name"],
                    email=vendor["email"],
                    created_at=datetime.datetime.fromisoformat(vendor["createdAt"]),
                    updated_at=datetime.datetime.fromisoformat(vendor["updatedAt"]),
                )
            )

        return vendors
