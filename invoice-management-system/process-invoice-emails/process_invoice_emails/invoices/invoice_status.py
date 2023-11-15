from enum import StrEnum


class InvoiceStatus(StrEnum):
    CREATED = "created"
    IN_REVIEW = "inReview"

    @staticmethod
    def from_str(label: str):
        if label == "created":
            return InvoiceStatus["CREATED"]
        elif label == "inReview":
            return InvoiceStatus["IN_REVIEW"]
        else:
            raise ValueError(f"Invalid label {label}")
