import {Knex} from 'knex';
import {
  ErrorResponse,
  ErrorResponseCode,
  Vendor,
  VendorsClient,
} from '../../../common/clients/vendors';
import {Invoice} from '../../models';
import {NotFoundError} from '../../../errors';

interface InvoicesServiceOptions {
  db: Knex;
  vendors: {
    client: VendorsClient;
  };
}

class InvoicesService {
  private readonly invoicesTable = 'invoices';

  constructor(private readonly options: InvoicesServiceOptions) {}

  async createInvoice(vendorId: string): Promise<Invoice> {
    let vendor!: Vendor;

    try {
      vendor = await this.options.vendors.client.getVendorById(vendorId);
    } catch (err) {
      if (err instanceof ErrorResponse) {
        if (err.code === ErrorResponseCode.NotFound) {
          throw new NotFoundError(`Vendor ${vendorId} not found`);
        }
        throw err;
      }
    }

    const [invoice] = await this.options
      .db<Invoice>(this.invoicesTable)
      .insert({
        vendorId: vendor.id,
      })
      .returning('*');

    return invoice;
  }
}

export {InvoicesService};
