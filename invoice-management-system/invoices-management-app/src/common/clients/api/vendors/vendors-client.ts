import axios, {isAxiosError} from 'axios';
import {Vendor} from './models';
import {ErrorResponse} from '../errors';

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
    try {
      const {data: vendor} = await axios.post(this.options.baseUrl, options);

      return this.transformVendorResponse(vendor);
    } catch (err) {
      throw this.tryMakeErrorResponse(err);
    }
  }

  async getVendorById(vendorId: string): Promise<Vendor> {
    try {
      const {data: vendor} = await axios.get(
        `${this.options.baseUrl}/${vendorId}`
      );

      return this.transformVendorResponse(vendor);
    } catch (err) {
      throw this.tryMakeErrorResponse(err);
    }
  }

  async listVendors(options?: ListVendorsOptions): Promise<Vendor[]> {
    try {
      const params: {orderBy?: string[]} = {};

      if (options?.orderBy) {
        params.orderBy = options.orderBy.map(
          this.orderByClauseToQueryParamClause
        );
      }

      const {data: vendors} = await axios.get(this.options.baseUrl, {
        params,
      });

      return vendors.map(this.transformVendorResponse);
    } catch (err) {
      throw this.tryMakeErrorResponse(err);
    }
  }

  async deleteVendorById(vendorId: string): Promise<void> {
    try {
      await axios.delete(`${this.options.baseUrl}/${vendorId}`);
    } catch (err) {
      throw this.tryMakeErrorResponse(err);
    }
  }

  private orderByClauseToQueryParamClause(
    orderByClause: OrderByClause
  ): string {
    return `${orderByClause.field} ${orderByClause.direction}`;
  }

  private transformVendorResponse(vendor: Vendor): Vendor {
    return {
      ...vendor,
      createdAt: new Date(vendor.createdAt),
      updatedAt: new Date(vendor.updatedAt),
    };
  }

  private tryMakeErrorResponse(err: unknown) {
    if (isAxiosError(err)) {
      if (err.response) {
        const errorData = err.response.data['error'];

        return new ErrorResponse(errorData.code, errorData.message);
      }
    }

    return err;
  }
}

export {VendorsClient};
