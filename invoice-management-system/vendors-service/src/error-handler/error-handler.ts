import {Request, Response} from 'express';
import {isCelebrateError} from 'celebrate';
import {StatusCodes} from 'http-status-codes';
import {
  AlreadyExistsError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../errors';

enum ErrorResponseCode {
  AlreadyExists = 'alreadyExists',
  Forbidden = 'forbidden',
  GeneralException = 'generalException',
  InvalidRequest = 'invalidRequest',
  NotFound = 'notFound',
  Unauthorized = 'unauthorized',
}

class ErrorResponse {
  readonly error;

  constructor(code: ErrorResponseCode, message: string, innerError?: unknown) {
    this.error = {
      code,
      message,
      innerError,
    };
  }
}

class ErrorHandler {
  public async handleError(err: Error, req: Request, res: Response) {
    req.log.error({err});

    if (isCelebrateError(err)) {
      const errors = Array.from(err.details, ([, value]) => value.message);
      const errorMessage = errors.join('\n');
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json(
          new ErrorResponse(ErrorResponseCode.InvalidRequest, errorMessage)
        );
    }

    if (err instanceof AlreadyExistsError) {
      return res
        .status(StatusCodes.CONFLICT)
        .json(
          new ErrorResponse(ErrorResponseCode.AlreadyExists, err.message)
        );
    }

    if (err instanceof ForbiddenError) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json(new ErrorResponse(ErrorResponseCode.Forbidden, err.message));
    }

    if (err instanceof NotFoundError) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json(new ErrorResponse(ErrorResponseCode.NotFound, err.message));
    }

    if (err instanceof RangeError) {
      return res
        .status(StatusCodes.UNPROCESSABLE_ENTITY)
        .json(
          new ErrorResponse(ErrorResponseCode.InvalidRequest, err.message)
        );
    }

    if (err instanceof UnauthorizedError) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json(
          new ErrorResponse(ErrorResponseCode.Unauthorized, 'unauthorized')
        );
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(
        new ErrorResponse(
          ErrorResponseCode.GeneralException,
          'internal server error'
        )
      );
  }
}

const errorHandler = new ErrorHandler();

export {errorHandler};
