import {Router} from 'express';
import {Knex} from 'knex';

interface HealthCheckRouterOptions {
  db: Knex;
}

class HealthCheckRouter {
  constructor(private readonly options: HealthCheckRouterOptions) {}

  get router() {
    const router = Router();

    router.get('/', async (req, res, next) => {
      try {
        await this.options.db.raw('SELECT 1');
        return res.json({});
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {HealthCheckRouter};
