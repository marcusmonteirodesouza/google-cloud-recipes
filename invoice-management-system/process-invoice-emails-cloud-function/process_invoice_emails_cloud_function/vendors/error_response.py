import json


class ErrorResponse:
    def __init__(self, code: str, message: str):
        self.code = code
        self.message = message

    def __repr__(self):
        return json.dumps(self.__dict__)
