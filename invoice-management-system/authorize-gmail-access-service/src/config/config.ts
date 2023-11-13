import Joi from 'joi';
import {NodeEnv} from '../common/enums';

const envVarsSchema = Joi.object()
  .keys({
    BASE_URL: Joi.string().uri().required(),
    GMAIL_ADDRESS: Joi.string().email().required(),
    GMAIL_PUSH_NOTIFICATIONS_PUBSUB_TOPIC_ID: Joi.string().required(),
    // See https://github.com/GoogleCloudPlatform/express-oauth2-handlers#configuration
    GOOGLE_OAUTH2_CLIENT_ID: Joi.string().required(),
    GOOGLE_OAUTH2_CLIENT_SECRET: Joi.string().required(),
    LOG_LEVEL: Joi.string().valid('debug', 'info').required(),
    NODE_ENV: Joi.string()
      .valid(NodeEnv.Development, NodeEnv.Test, NodeEnv.Production)
      .required(),
    PORT: Joi.number().integer().required(),
  })
  .unknown();

const {value: envVars, error} = envVarsSchema.validate(process.env);

if (error) {
  throw error;
}

const config = {
  baseUrl: envVars.BASE_URL,
  gmail: {
    address: envVars.GMAIL_ADDRESS,
    pushNotifications: {
      pubsub: {
        topic: {
          id: envVars.GMAIL_PUSH_NOTIFICATIONS_PUBSUB_TOPIC_ID,
        },
      },
    },
  },
  google: {
    oauth2: {
      clientID: envVars.GOOGLE_OAUTH2_CLIENT_ID,
      clientSecret: envVars.GOOGLE_OAUTH2_CLIENT_SECRET,
    },
    project: {
      id: envVars.GCP_PROJECT,
    },
  },
  logLevel: envVars.LOG_LEVEL,
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
};

export {config};
