import path from 'path';
import express from 'express';
import {OAuth2Client} from 'google-auth-library';
import {RegionBackendServicesClient} from '@google-cloud/compute';
import * as lb from '@google-cloud/logging-bunyan';
import {ApiClient} from './common/clients/api';
import {HealthCheckRouter} from './health-check';
import {VendorsRouter} from './vendors';
import {InvoicesRouter} from './invoices';
import {Auth} from './middleware';
import {errorHandler} from './error-handler';
import {config} from './config';

async function createApp() {
  const oAuth2Client = new OAuth2Client({
    project_id: config.google.project.id,
  });

  const regionBackendServicesClient = new RegionBackendServicesClient({
    projectId: config.google.project.id,
  });

  const auth = new Auth({
    google: {
      backendService: {
        name: config.google.backendService.name,
      },
      project: {
        id: config.google.project.id,
        number: config.google.project.number,
      },
      oAuth2Client,
      region: config.google.region,
      regionBackendServicesClient,
    },
  });

  const apiClient = new ApiClient({
    vendorsService: {
      baseUrl: config.vendorsService.baseUrl,
    },
    invoicesService: {
      baseUrl: config.invoicesService.baseUrl,
    },
  });

  const healthCheckRouter = new HealthCheckRouter().router;

  const vendorsRouter = new VendorsRouter({apiClient}).router;

  const invoicesRouter = new InvoicesRouter({apiClient}).router;

  const app = express();

  const {logger, mw} = await lb.express.middleware({
    level: config.logLevel,
    redirectToStdout: true,
    skipParentEntryForCloudRun: true,
  });

  app.use(express.static(path.join(__dirname, 'public')));

  app.set('views', path.join(__dirname, 'views', 'pages'));
  app.set('view engine', 'pug');

  app.use(mw);

  app.use(express.urlencoded({extended: true}));

  app.use(auth.requireAuth);

  app.get('/', (req, res) => {
    res.render('index');
  });

  app.use('/healthz', healthCheckRouter);

  app.use('/vendors', vendorsRouter);

  app.use('/invoices', invoicesRouter);

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

  return {app, logger};
}

export {createApp};
