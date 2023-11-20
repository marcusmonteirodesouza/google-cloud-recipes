import {Router} from 'express';
import {ApiClient, ErrorResponse} from '../../../common/clients/api';
import {StatusCodes} from 'http-status-codes';

interface VendorsRouterOptions {
  apiClient: ApiClient;
}

class VendorsRouter {
  constructor(private readonly options: VendorsRouterOptions) {}

  get router() {
    const router = Router();

    router.get('/', async (req, res, next) => {
      try {
        const vendors = await this.options.apiClient.vendors.listVendors({
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

    router.get('/detail/:vendorId', async (req, res, next) => {
      try {
        const {vendorId} = req.params;

        const vendor = await this.options.apiClient.vendors.getVendorById(vendorId);

        return res.render('vendors/detail', {
          title: `${vendor.name} details`,
          vendor
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
          await this.options.apiClient.vendors.createVendor({name, email});
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

        await this.options.apiClient.vendors.deleteVendorById(vendorId);

        return res.sendStatus(StatusCodes.NO_CONTENT);
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {VendorsRouter};
