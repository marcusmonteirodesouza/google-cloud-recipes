import {createApp} from './app';
import {config} from './config';

createApp().then(({app, logger}) => {
  app.listen(config.port, () => {
    logger.info(
      `Google Cloud Demos - Invoice Management System - Vendors Management App server listening on port ${config.port}...`
    );
  });
});
