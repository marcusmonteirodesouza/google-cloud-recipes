class ErrorResponse extends Error {
  constructor(
    readonly code?: string,
    message?: string
  ) {
    super(message);
  }
}

export {ErrorResponse};
