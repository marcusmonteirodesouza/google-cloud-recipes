import express from 'express';
import * as lb from '@google-cloud/logging-bunyan';
import {connect} from './db';
import {HealthCheckRouter} from './health-check';
import {VendorsService, VendorsRouter} from './vendors';
import {errorHandler} from './error-handler';
import {config} from './config';

async function createApp() {
  const db = connect();

  await db.migrate.latest();

  const vendorsService = new VendorsService({
    db,
  });

  const healthCheckRouter = new HealthCheckRouter({db}).router;

  const vendorsRouter = new VendorsRouter({vendorsService}).router;

  const app = express();

  const {logger, mw} = await lb.express.middleware({
    level: config.logLevel,
    redirectToStdout: true,
    skipParentEntryForCloudRun: true,
  });

  app.use(mw);

  app.use(express.json());

  app.use('/healthz', healthCheckRouter);

  app.use('/', vendorsRouter);

  app.use(
    async (
      err: Error,
      req: express.Request,
      res: express.Response,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _next: express.NextFunction
    ) => {
      await errorHandler.handleError(err, req, res);
    }
  );

  return {app, db, logger};
}

export {createApp};
