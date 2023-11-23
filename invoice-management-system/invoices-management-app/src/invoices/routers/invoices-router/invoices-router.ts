import {Router} from 'express';
import {sortBy} from 'lodash';
import {
  ApiClient,
  ErrorResponse,
  InvoiceStatus,
} from '../../../common/clients/api';

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

        const invoiceDocumentFile =
          await this.options.apiClient.invoices.downloadInvoiceDocumentFile(
            invoiceId
          );

        const currencies =
          await this.options.apiClient.invoices.listCurrencies();

        const vendor = await this.options.apiClient.vendors.getVendorById(
          invoice.vendorId
        );

        return res.render('invoices/details', {
          title: `Invoice Details - ${vendor.name} ${invoice.vendorInvoiceId}`,
          invoice: {
            ...invoice,
            vendorName: vendor.name,
          },
          invoiceDocumentFile: {
            content: invoiceDocumentFile.content.toString('base64'),
            contentType: invoiceDocumentFile.contentType,
          },
          currencies,
        });
      } catch (err) {
        return next(err);
      }
    });

    router.post('/:invoiceId', async (req, res, next) => {
      try {
        const {invoiceId} = req.params;

        const invoice =
          await this.options.apiClient.invoices.getInvoiceById(invoiceId);

        const currencies =
          await this.options.apiClient.invoices.listCurrencies();

        const vendor = await this.options.apiClient.vendors.getVendorById(
          invoice.vendorId
        );

        const {
          status,
          vendorAddress,
          date,
          dueDate,
          netAmount,
          totalTaxAmount,
          totalAmount,
          currency,
        } = req.body;

        try {
          const updatedInvoice =
            await this.options.apiClient.invoices.updateInvoice(invoiceId, {
              status,
              vendorAddress,
              date: date && {
                year: Number.parseInt(date.slice(0, 4)),
                month: Number.parseInt(date.slice(5, 7)),
                day: Number.parseInt(date.slice(8, 11)),
              },
              dueDate: dueDate && {
                year: Number.parseInt(dueDate.slice(0, 4)),
                month: Number.parseInt(dueDate.slice(5, 7)),
                day: Number.parseInt(dueDate.slice(8, 11)),
              },
              netAmount,
              totalTaxAmount,
              totalAmount,
              currency,
            });

          return res.redirect(`/invoices/${updatedInvoice.id}`);
        } catch (err) {
          if (err instanceof ErrorResponse) {
            return res.render('invoices/details', {
              title: `Invoice Details - ${vendor.name} ${invoice.vendorInvoiceId}`,
              invoice: {
                ...invoice,
                vendorName: vendor.name,
              },
              currencies,
              error: err.message,
            });
          }

          throw err;
        }
      } catch (err) {
        return next(err);
      }
    });

    return router;
  }
}

export {InvoicesRouter};
