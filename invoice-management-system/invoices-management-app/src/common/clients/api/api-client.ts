import {InvoicesClient} from './invoices';
import {VendorsClient} from './vendors';

interface ApiClientOptions {
  invoicesService: {
    baseUrl: string;
  };
  vendorsService: {
    baseUrl: string;
  };
}

class ApiClient {
  readonly invoices: InvoicesClient;
  readonly vendors: VendorsClient;

  constructor(options: ApiClientOptions) {
    this.invoices = new InvoicesClient({
      baseUrl: options.invoicesService.baseUrl,
    });
    this.vendors = new VendorsClient({
      baseUrl: options.vendorsService.baseUrl,
    });
  }
}

export {ApiClient};
