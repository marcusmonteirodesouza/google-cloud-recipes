import express from 'express';
import * as lb from '@google-cloud/logging-bunyan';
import {DocumentProcessorServiceClient} from '@google-cloud/documentai';
import {Storage} from '@google-cloud/storage';
import {AddressValidationClient} from '@googlemaps/addressvalidation';
import expressFileUpload from 'express-fileupload';
import {connect} from './db';
import {HealthCheckRouter} from './health-check';
import {InvoicesService, InvoicesRouter} from './invoices';
import {errorHandler} from './error-handler';
import {config} from './config';
import {VendorsClient} from './common/clients/vendors';

async function createApp() {
  const db = connect();

  await db.migrate.latest();

  const documentProcessorServiceClient = new DocumentProcessorServiceClient({
    projectId: config.google.project.id,
  });

  const storage = new Storage({
    projectId: config.google.project.id,
  });

  const addressValidationClient = new AddressValidationClient({
    projectId: config.google.project.id,
  });

  const vendorsClient = new VendorsClient({
    baseUrl: config.vendorsService.baseUrl,
  });

  const invoicesService = new InvoicesService({
    db,
    google: {
      addressValidation: {
        client: addressValidationClient,
      },
      documentAi: {
        documentProcessorServiceClient,
        processors: {
          invoiceParser: {
            id: config.google.documentAi.processors.invoiceParser.id,
          },
        },
      },
      storage: {
        client: storage,
        buckets: {
          invoices: {
            documents: config.google.storage.buckets.invoices.documents,
          },
        },
      },
    },
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

  app.use(expressFileUpload());

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
