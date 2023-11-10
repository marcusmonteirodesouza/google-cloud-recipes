import {Router} from 'express';
import {Joi, Segments, celebrate} from 'celebrate';
import {StatusCodes} from 'http-status-codes';
import { VendorsClient } from '../../../common/clients/vendors';
import {InvoicesService} from '../../services';

interface InvoicesRouterOptions {
  vendors: {
    client: VendorsClient
  }
  invoices: {
    service: InvoicesService;
  }
}

class InvoicesRouter {
  constructor(private readonly options: InvoicesRouterOptions) {}

  get router() {
    const router = Router();

    router.post(
      '/',
      celebrate({
        [Segments.BODY]: Joi.object().keys({
          vendorId: Joi.string().required(),
        }),
      }),
      async (req, res, next) => {
        try {
          const {vendorId} = req.body;

          const invoice = await this.options.invoices.service.createInvoice(
            vendorId
          );

          return res.status(StatusCodes.CREATED).json(invoice);
        } catch (err) {
          return next(err);
        }
      }
    );

    return router;
  }
}

export {InvoicesRouter};
