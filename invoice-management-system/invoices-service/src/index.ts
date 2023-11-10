import {createApp} from './app';
import {config} from './config';

createApp().then(({app, db, logger}) => {
  const server = app.listen(config.port, () => {
    logger.info(
      `Google Cloud Demos - Invoice Management System - Invoices Service server listening on port ${config.port}...`
    );
  });

  async function shutdown() {
    logger.info(
      'Google Cloud Demos - Invoice Management System - Invoices Service server shutting down...'
    );
    await db.destroy();
    server.close(() => {
      logger.info(
        'Google Cloud Demos - Invoice Management System - Invoices Service server closed'
      );
    });
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
});
