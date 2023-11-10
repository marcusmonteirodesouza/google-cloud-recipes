import axios from 'axios';
import {Vendor} from './models';

interface VendorsOptions {
  baseUrl: string;
}

interface OrderByClause {
  field: 'name';
  direction: 'asc' | 'desc';
}

interface ListVendorsOptions {
  name?: string;
  orderBy?: OrderByClause[];
}

class VendorsClient {
  constructor(private readonly options: VendorsOptions) {}

  async getVendorById(vendorId: string): Promise<Vendor> {
    const {data: vendor} = await axios.get(`${this.options.baseUrl}/${vendorId}`);

    return vendor;
  }

  async listVendors(options?: ListVendorsOptions): Promise<Vendor[]> {
    const params: {name?: string, orderBy?: string} = {};

    if (options?.name) {
      params.name = options.name
    }

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

  private orderByClauseToQueryParamClause(
    orderByClause: OrderByClause
  ): string {
    return `${orderByClause.field} ${orderByClause.direction}`;
  }
}

export {VendorsClient};
