import datetime
import json


class Vendor:
    def __init__(
        self,
        _id: str,
        name: str,
        email: str,
        created_at: datetime.datetime,
        updated_at: datetime.datetime,
    ):
        self._id = _id
        self.name = name
        self.email = email
        self.created_at = created_at
        self.updated_at = updated_at

    @property
    def id(self):
        return self._id

    def __repr__(self):
        return json.dumps(
            {
                "id": self.id,
                "name": self.name,
                "email": self.email,
                "created_at": self.created_at.isoformat(),
                "updated_at": self.updated_at.isoformat(),
            }
        )
