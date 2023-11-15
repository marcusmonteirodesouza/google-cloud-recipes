import {Router} from 'express';
import {Joi, Segments, celebrate} from 'celebrate';
import {StatusCodes} from 'http-status-codes';
import {VendorsService} from '../../services';

interface VendorsRouterOptions {
  vendorsService: VendorsService;
}

class VendorsRouter {
  constructor(private readonly options: VendorsRouterOptions) {}

  get router() {
    const router = Router();

    router.post(
      '/',
      celebrate({
        [Segments.BODY]: Joi.object().keys({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }),
      }),
      async (req, res, next) => {
        try {
          const {name, email} = req.body;

          const vendor = await this.options.vendorsService.createVendor({
            name,
            email,
          });

          return res.status(StatusCodes.CREATED).json(vendor);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.get(
      '/',
      celebrate({
        [Segments.QUERY]: Joi.object().keys({
          name: Joi.string(),
          orderBy: Joi.string(),
        }),
      }),
      async (req, res, next) => {
        try {
          const {name} = req.query;

          const orderByQueryParam = req.query.orderBy as string;

          let orderBy: {
            field: 'name';
            direction: 'asc' | 'desc';
          }[] = [];

          if (orderByQueryParam) {
            orderBy = orderByQueryParam.split(',').map(orderByClause => {
              const [field, direction] = orderByClause.split(' ');

              if (field !== 'name') {
                throw new Error();
              }

              if (direction !== 'asc' && direction !== 'desc') {
                throw new RangeError(
                  `Invalid direction in orderBy clause ${orderByClause}`
                );
              }

              return {
                field,
                direction,
              };
            });
          }

          const vendors = await this.options.vendorsService.listVendors({
            name: name as string,
            orderBy,
          });

          return res.json(vendors);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.get(
      '/:vendorId',
      celebrate({
        [Segments.PARAMS]: Joi.object().keys({
          vendorId: Joi.string().uuid().required(),
        }),
      }),
      async (req, res, next) => {
        try {
          const {vendorId} = req.params;

          const vendor =
            await this.options.vendorsService.getVendorById(vendorId);

          if (!vendor) {
            throw new Error(`Vendor ${vendorId} not found`)
          }

          return res.json(vendor);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.delete('/:vendorId', async (req, res, next) => {
      try {
        const {vendorId} = req.params;

        await this.options.vendorsService.deleteVendorById(vendorId);

        return res.status(StatusCodes.NO_CONTENT).json({});
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {VendorsRouter};
