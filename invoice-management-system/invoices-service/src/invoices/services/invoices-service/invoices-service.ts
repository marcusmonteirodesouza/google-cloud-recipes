import {Knex} from 'knex';
import {VendorsClient} from '../../../common/clients/vendors'
import {Invoice} from '../../models';

interface InvoicesServiceOptions {
  db: Knex;
  vendors: {
    client: VendorsClient
  }
}

class InvoicesService {
  private readonly invoicesTable = 'invoices';

  constructor(private readonly options: InvoicesServiceOptions) {}

  async createInvoice(vendorId: string): Promise<Invoice> {
    const vendor = await this.options.vendors.client.getVendorById(vendorId);

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
