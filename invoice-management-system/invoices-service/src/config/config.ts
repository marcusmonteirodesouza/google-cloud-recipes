import {Joi} from 'celebrate';
import {NodeEnv} from '../common/enums';

const envVarsSchema = Joi.object()
  .keys({
    GOOGLE_DOCUMENT_AI_INVOICE_PARSER_PROCESSOR_ID: Joi.string().required(),
    GOOGLE_PROJECT_ID: Joi.string().required(),
    GOOGLE_STORAGE_BUCKET_INVOICE_DOCUMENTS: Joi.string().required(),
    LOG_LEVEL: Joi.string().valid('debug', 'info').required(),
    NODE_ENV: Joi.string()
      .valid(NodeEnv.Development, NodeEnv.Test, NodeEnv.Production)
      .required(),
    PGHOST: Joi.string().required(),
    PGPORT: Joi.number().integer().required(),
    PGUSERNAME: Joi.string().required(),
    PGPASSWORD: Joi.string().required(),
    PGDATABASE: Joi.string().required(),
    PGPOOL_MIN_CONNECTIONS: Joi.number().integer().required(),
    PGPOOL_MAX_CONNECTIONS: Joi.number().integer().required(),
    PORT: Joi.number().integer().required(),
    VENDORS_SERVICE_BASE_URL: Joi.string().uri().required(),
  })
  .unknown();

const {value: envVars, error} = envVarsSchema.validate(process.env);

if (error) {
  throw error;
}

const config = {
  google: {
    documentAi: {
      processors: {
        invoiceParser: {
          id: envVars.GOOGLE_DOCUMENT_AI_INVOICE_PARSER_PROCESSOR_ID,
        },
      },
    },
    project: {
      id: envVars.GOOGLE_PROJECT_ID,
    },
    storage: {
      buckets: {
        invoices: {
          documents: envVars.GOOGLE_STORAGE_BUCKET_INVOICE_DOCUMENTS,
        },
      },
    },
  },
  logLevel: envVars.LOG_LEVEL,
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  pg: {
    host: envVars.PGHOST,
    port: envVars.PGPORT,
    username: envVars.PGUSERNAME,
    password: envVars.PGPASSWORD,
    name: envVars.PGDATABASE,
    pool: {
      connections: {
        min: envVars.PGPOOL_MIN_CONNECTIONS,
        max: envVars.PGPOOL_MAX_CONNECTIONS,
      },
    },
  },
  vendorsService: {
    baseUrl: envVars.VENDORS_SERVICE_BASE_URL,
  },
};

export {config};