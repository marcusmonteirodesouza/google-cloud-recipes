import {Router} from 'express';
import {VendorsClient, ErrorResponse} from '../../../common/clients/vendors';
import {StatusCodes} from 'http-status-codes';

interface VendorsRouterOptions {
  vendorsClient: VendorsClient;
}

class VendorsRouter {
  constructor(private readonly options: VendorsRouterOptions) {}

  get router() {
    const router = Router();

    router.get('/', async (req, res, next) => {
      try {
        const vendors = await this.options.vendorsClient.listVendors({
          orderBy: [
            {
              field: 'name',
              direction: 'asc',
            },
          ],
        });

        return res.render('vendors', {
          title: 'Vendors list',
          vendors,
        });
      } catch (err) {
        return next(err);
      }
    });

    router.get('/add', async (req, res, next) => {
      try {
        return res.render('vendors/add', {
          title: 'Add Vendor',
          errors: [],
        });
      } catch (err) {
        return next(err);
      }
    });

    router.post('/add', async (req, res, next) => {
      try {
        const {name, email} = req.body;

        try {
          await this.options.vendorsClient.createVendor({name, email});
        } catch (err) {
          if (err instanceof ErrorResponse) {
            return res.render('vendors/add', {
              title: 'Add Vendor',
              errors: [err.message],
            });
          }
          req.log.error({err});
          throw err;
        }

        return res.redirect('/vendors');
      } catch (err) {
        return next(err);
      }
    });

    router.delete('/:vendorId', async (req, res, next) => {
      try {
        const {vendorId} = req.params;

        await this.options.vendorsClient.deleteVendorById(vendorId);

        return res.sendStatus(StatusCodes.NO_CONTENT);
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {VendorsRouter};
