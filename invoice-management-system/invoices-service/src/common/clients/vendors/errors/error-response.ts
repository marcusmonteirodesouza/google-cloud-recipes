class ErrorResponse extends Error {
  constructor(code?: string, message?: string) {
    super(message);
  }
}

export {ErrorResponse};
