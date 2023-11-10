import knex, {Knex} from 'knex';
const knexStringcase = require('knex-stringcase');
import {config} from '../config';

function connect() {
  const knexConfig: Knex.Config = {
    client: 'pg',
    connection: {
      host: config.pg.host,
      port: config.pg.port,
      database: config.pg.name,
      user: config.pg.username,
      password: config.pg.password,
    },
    pool: {
      min: config.pg.pool.connections.min,
      max: config.pg.pool.connections.max,
    },
  };

  const options = knexStringcase(knexConfig);

  const db = knex(options);

  return db;
}

export {connect};
