import bunyan from 'bunyan';
import {LoggingBunyan} from '@google-cloud/logging-bunyan';
import {config} from '../config';
import {NodeEnv} from '../common/enums';

const logger = bunyan.createLogger({
  name: config.googleCloud.run.service,
  level: config.logLevel,
  streams: [],
});

if (config.nodeEnv === NodeEnv.Production) {
  const loggingBunyan = new LoggingBunyan();

  logger.addStream(loggingBunyan.stream(config.logLevel));
} else {
  logger.addStream({stream: process.stdout, level: config.logLevel});
}

export {logger};
