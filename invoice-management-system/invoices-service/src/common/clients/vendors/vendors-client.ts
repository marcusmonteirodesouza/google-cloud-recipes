import axios, {isAxiosError} from 'axios';
import {Vendor} from './models';
import {ErrorResponse} from './errors';

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
    try {
      const {data: vendor} = await axios.get(
        `${this.options.baseUrl}/${vendorId}`
      );

      return vendor;
    } catch (err) {
      throw this.tryMakeErrorResponse(err);
    }
  }

  async listVendors(options?: ListVendorsOptions): Promise<Vendor[]> {
    try {
      const params: {name?: string; orderBy?: string} = {};

      if (options?.name) {
        params.name = options.name;
      }

      if (options?.orderBy) {
        params.orderBy = options.orderBy
          .slice(1)
          .reduce((acc, orderByClause) => {
            return `${acc} ${this.orderByClauseToQueryParamClause(
              orderByClause
            )}`;
          }, this.orderByClauseToQueryParamClause(options.orderBy[0]));
      }

      const {data: vendors} = await axios.get(this.options.baseUrl, {
        params,
      });

      return vendors;
    } catch (err) {
      throw this.tryMakeErrorResponse(err);
    }
  }

  private tryMakeErrorResponse(err: unknown) {
    if (isAxiosError(err)) {
      return new ErrorResponse(
        err.response?.data.code,
        err.response?.data.message
      );
    }
    return err;
  }

  private orderByClauseToQueryParamClause(
    orderByClause: OrderByClause
  ): string {
    return `${orderByClause.field} ${orderByClause.direction}`;
  }
}

export {VendorsClient};