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

    def __repr__(self):
        return json.dumps(self.__dict__)
