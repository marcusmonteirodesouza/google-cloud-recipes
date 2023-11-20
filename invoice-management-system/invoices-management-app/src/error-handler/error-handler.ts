import {Request, Response} from 'express';
import {StatusCodes} from 'http-status-codes';
import {UnauthorizedError} from '../errors';

class ErrorPageError {
  constructor(readonly message: string) {}
}

class ErrorHandler {
  public async handleError(err: Error, req: Request, res: Response) {
    req.log.error({err});

    if (err instanceof UnauthorizedError) {
      return res.status(StatusCodes.UNAUTHORIZED).render('error', {
        error: new ErrorPageError('Unauthorized'),
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).render('error', {
      error: new ErrorPageError('Internal Server Error'),
    });
  }
}

const errorHandler = new ErrorHandler();

export {errorHandler};
