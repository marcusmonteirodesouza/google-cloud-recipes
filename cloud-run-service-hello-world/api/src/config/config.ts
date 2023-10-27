import Joi from 'joi';
import {NodeEnv} from '../common/enums';

const envVarsSchema = Joi.object()
  .keys({
    K_SERVICE: Joi.string().required(), // See https://cloud.google.com/run/docs/container-contract#services-env-vars
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
  googleCloud: {
    run: {
      service: envVars.K_SERVICE,
    },
  },
  logLevel: envVars.LOG_LEVEL,
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
};

export {config};
