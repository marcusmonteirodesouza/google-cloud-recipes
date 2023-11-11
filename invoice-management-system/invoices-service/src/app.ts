import express from 'express';
import * as lb from '@google-cloud/logging-bunyan';
import {connect} from './db';
import {HealthCheckRouter} from './health-check';
import {InvoicesService, InvoicesRouter} from './invoices';
import {errorHandler} from './error-handler';
import {config} from './config';
import {VendorsClient} from './common/clients/vendors';

async function createApp() {
  const db = connect();

  await db.migrate.latest();

  const vendorsClient = new VendorsClient({
    baseUrl: config.vendorsService.baseUrl,
  });

  const invoicesService = new InvoicesService({
    db,
    vendors: {
      client: vendorsClient,
    },
  });

  const healthCheckRouter = new HealthCheckRouter({db}).router;

  const invoicesRouter = new InvoicesRouter({
    vendors: {client: vendorsClient},
    invoices: {service: invoicesService},
  }).router;

  const app = express();

  const {logger, mw} = await lb.express.middleware({
    level: config.logLevel,
    redirectToStdout: true,
    skipParentEntryForCloudRun: true,
  });

  app.use(mw);

  app.use(express.json());

  app.use('/healthz', healthCheckRouter);

  app.use('/', invoicesRouter);

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
