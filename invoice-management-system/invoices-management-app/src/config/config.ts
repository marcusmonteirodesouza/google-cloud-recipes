import Joi from 'joi';
import {NodeEnv} from '../common/enums';

const envVarsSchema = Joi.object()
  .keys({
    GOOGLE_BACKEND_SERVICE_NAME: Joi.string().required(),
    GOOGLE_PROJECT_ID: Joi.string().required(),
    GOOGLE_PROJECT_NUMBER: Joi.string().required(),
    GOOGLE_REGION: Joi.string().required(),
    LOG_LEVEL: Joi.string().valid('debug', 'info').required(),
    NODE_ENV: Joi.string()
      .valid(NodeEnv.Development, NodeEnv.Test, NodeEnv.Production)
      .required(),
    PORT: Joi.number().integer().required(),
    INVOICES_SERVICE_BASE_URL: Joi.string().uri().required(),
    VENDORS_SERVICE_BASE_URL: Joi.string().uri().required(),
  })
  .unknown();

const {value: envVars, error} = envVarsSchema.validate(process.env);

if (error) {
  throw error;
}

const config = {
  google: {
    backendService: {
      name: envVars.GOOGLE_BACKEND_SERVICE_NAME,
    },
    project: {
      id: envVars.GOOGLE_PROJECT_ID,
      number: envVars.GOOGLE_PROJECT_NUMBER,
    },
    region: envVars.GOOGLE_REGION,
  },
  logLevel: envVars.LOG_LEVEL,
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  invoicesService: {
    baseUrl: envVars.INVOICES_SERVICE_BASE_URL,
  },
  vendorsService: {
    baseUrl: envVars.VENDORS_SERVICE_BASE_URL,
  },
};

export {config};
