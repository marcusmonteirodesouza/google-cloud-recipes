import {Router} from 'express';
import {Joi, Segments, celebrate} from 'celebrate';
import {UploadedFile} from 'express-fileupload';
import {StatusCodes} from 'http-status-codes';
import {VendorsClient} from '../../../common/clients/vendors';
import {InvoicesService} from '../../services';
import {InvoiceStatus} from '../../models';

interface InvoicesRouterOptions {
  vendors: {
    client: VendorsClient;
  };
  invoices: {
    service: InvoicesService;
  };
}

class InvoicesRouter {
  constructor(private readonly options: InvoicesRouterOptions) {}

  get router() {
    const router = Router();

    router.post('/', async (req, res, next) => {
      try {
        if (!req.files) {
          throw new RangeError('No files were uploaded');
        }

        const fileKeys = Object.keys(req.files);

        if (fileKeys.length === 0) {
          throw new RangeError('No files were uploaded');
        }

        if (fileKeys.length !== 1) {
          throw new RangeError('Must upload a single file');
        }

        const invoiceFile = req.files[fileKeys[0]] as UploadedFile;

        const invoice = await this.options.invoices.service.createInvoice({
          document: {
            content: invoiceFile.data,
            mimeType: invoiceFile.mimetype,
          },
        });

        return res.status(StatusCodes.CREATED).json(invoice);
      } catch (err) {
        return next(err);
      }
    });

    router.get(
      '/:invoiceId',
      celebrate({
        [Segments.PARAMS]: Joi.object().keys({
          invoiceId: Joi.string().uuid().required(),
        }),
      }),
      async (req, res, next) => {
        try {
          const {invoiceId} = req.params;

          const invoice =
            await this.options.invoices.service.getInvoiceById(invoiceId);

          return res.json(invoice);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.get(
      '/',
      celebrate({
        [Segments.QUERY]: Joi.object().keys({
          status: Joi.string().valid(...Object.values(InvoiceStatus)),
          vendorId: Joi.string().uuid(),
          orderBy: Joi.string(),
        }),
      }),
      async (req, res, next) => {
        try {
          const {status, vendorId} = req.query;

          const orderByQueryParam = req.query.orderBy as string;

          let orderBy: {
            field: 'dueDate';
            direction: 'asc' | 'desc';
          }[] = [];

          if (orderByQueryParam) {
            orderBy = orderByQueryParam.split(',').map(orderByClause => {
              const [field, direction] = orderByClause.split(' ');

              if (field !== 'dueDate') {
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

          const vendors = await this.options.invoices.service.listInvoices({
            status: status as InvoiceStatus,
            vendorId: vendorId as string,
            orderBy,
          });

          return res.json(vendors);
        } catch (err) {
          return next(err);
        }
      }
    );

    router.patch(
      '/:invoiceId',
      celebrate({
        [Segments.BODY]: Joi.object().keys({
          status: Joi.string().valid(...Object.values(InvoiceStatus)),
        }),
      }),
      async (req, res, next) => {
        try {
          const {invoiceId} = req.params;

          const {status} = req.body;

          const invoice = await this.options.invoices.service.updateInvoice(
            invoiceId,
            {status}
          );

          return res.json(invoice);
        } catch (err) {
          return next(err);
        }
      }
    );

    return router;
  }
}

export {InvoicesRouter};
