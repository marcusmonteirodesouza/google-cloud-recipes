import {Router} from 'express';
import {sortBy} from 'lodash';
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

        invoices = sortBy(invoices, ['vendorName', 'date', 'dueDate']);

        return res.render('invoices', {
          title: 'Invoices List',
          invoices,
        });
      } catch (err) {
        return next(err);
      }
    });

    router.get('/:invoiceId', async (req, res, next) => {
      try {
        const {invoiceId} = req.params;

        const invoice =
          await this.options.apiClient.invoices.getInvoiceById(invoiceId);

        const vendor = await this.options.apiClient.vendors.getVendorById(
          invoice.vendorId
        );

        return res.render('invoices/details', {
          title: `Invoice Details - ${vendor.name} ${invoice.vendorInvoiceId}`,
          invoice: {
            ...invoice,
            vendorName: vendor.name,
          },
        });
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {InvoicesRouter};
