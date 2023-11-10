import dotenv from 'dotenv';
dotenv.config();

import type {Knex} from 'knex';
import {config as appConfig} from './src/config';

const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: appConfig.pg.host,
    port: appConfig.pg.port,
    database: appConfig.pg.name,
    user: appConfig.pg.username,
    password: appConfig.pg.password,
  },
};

module.exports = config;
