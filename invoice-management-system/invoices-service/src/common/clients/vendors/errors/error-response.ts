enum ErrorResponseCode {
  AlreadyExists = 'alreadyExists',
  Forbidden = 'forbidden',
  GeneralException = 'generalException',
  InvalidRequest = 'invalidRequest',
  NotFound = 'notFound',
  Unauthorized = 'unauthorized',
}

class ErrorResponse extends Error {
  constructor(
    readonly code?: ErrorResponseCode,
    message?: string
  ) {
    super(message);
  }
}

export {ErrorResponse, ErrorResponseCode};
