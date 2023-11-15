import axios from 'axios';
import {Vendor} from './models';

interface VendorsClientOptions {
  baseUrl: string;
}

interface CreateVendorOptions {
  name: string;
  email: string;
}

interface ListVendorsOptions {
  orderBy?: OrderByClause[];
}

interface OrderByClause {
  field: 'name';
  direction: 'asc' | 'desc';
}

class VendorsClient {
  constructor(private readonly options: VendorsClientOptions) {}

  async createVendor(options: CreateVendorOptions): Promise<Vendor> {
    const {data: vendor} = await axios.post(this.options.baseUrl, {
      name: options.name,
      email: options.email,
    });

    return vendor;
  }

  async listVendors(options?: ListVendorsOptions): Promise<Vendor[]> {
    const params: {orderBy?: string} = {};

    if (options?.orderBy) {
      params.orderBy = options.orderBy.slice(1).reduce((acc, orderByClause) => {
        return `${acc} ${this.orderByClauseToQueryParamClause(orderByClause)}`;
      }, this.orderByClauseToQueryParamClause(options.orderBy[0]));
    }

    const {data: vendors} = await axios.get(this.options.baseUrl, {
      params,
    });

    return vendors;
  }

  async deleteVendorById(vendorId: string): Promise<void> {
    await axios.delete(`${this.options.baseUrl}/${vendorId}`);
  }

  private orderByClauseToQueryParamClause(
    orderByClause: OrderByClause
  ): string {
    return `${orderByClause.field} ${orderByClause.direction}`;
  }
}

export {VendorsClient};
