import bunyan from 'bunyan';
import {User} from '../../users';

export {};

declare global {
  namespace Express {
    export interface Request {
      log: ReturnType<typeof bunyan.createLogger>;
      user?: User;
    }
  }
}
