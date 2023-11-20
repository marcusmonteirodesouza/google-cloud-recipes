import {Router} from 'express';
import {ApiClient, InvoiceStatus} from '../../../common/clients/api';

interface InvoicesRouterOptions {
  apiClient: ApiClient;
}

class InvoicesRouter {
  constructor(private readonly options: InvoicesRouterOptions) {}

  get router() {
    const router = Router();

    router.get('/', async (req, res, next) => {
      try {
        let invoices = await this.options.apiClient.invoices.listInvoices({
          statuses: [
            InvoiceStatus.Created,
            InvoiceStatus.Approved,
            InvoiceStatus.NotApproved,
          ],
          orderBy: [
            {
              field: 'dueDate',
              direction: 'asc',
            },
          ],
        });

        invoices = await Promise.all(
          invoices.map(async invoice => {
            const vendor = await this.options.apiClient.vendors.getVendorById(
              invoice.vendorId
            );

            return {
              ...invoice,
              vendorName: vendor.name,
            };
          })
        );

        return res.render('invoices', {
          title: 'Invoices List',
          invoices,
        });
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {InvoicesRouter};
