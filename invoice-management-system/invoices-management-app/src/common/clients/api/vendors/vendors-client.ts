import axios, { isAxiosError } from 'axios';
import {Vendor} from './models';
import { ErrorResponse } from '../errors';

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

  async createVendor(options: CreateVendorOptions): Promise<Vendor | ErrorResponse> {
    try {
      const {data: vendor} = await axios.post(this.options.baseUrl, {
        name: options.name,
        email: options.email,
      });

      return vendor;
    } catch (err) {
      return this.tryReturnErrorResponse(err);
    }
  }

  async getVendorById(vendorId: string): Promise<Vendor | ErrorResponse> {
    try {
      const {data: vendor} = await axios.get(`${this.options.baseUrl}/${vendorId}`)

      return vendor;
    } catch (err) {
      return this.tryReturnErrorResponse(err);
    }
  }

  async listVendors(options?: ListVendorsOptions): Promise<Vendor[] | ErrorResponse> {
    try {
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
    } catch (err) {
      return this.tryReturnErrorResponse(err);
    }
  }

  async deleteVendorById(vendorId: string): Promise<void | ErrorResponse> {
    try {
      await axios.delete(`${this.options.baseUrl}/${vendorId}`);
    } catch (err) {
      return this.tryReturnErrorResponse(err);
    }
  }

  private orderByClauseToQueryParamClause(
    orderByClause: OrderByClause
  ): string {
    return `${orderByClause.field} ${orderByClause.direction}`;
  }

  private tryReturnErrorResponse(err: unknown): ErrorResponse {
    if (isAxiosError(err)) {
      if (err.response) {
        const errorData = err.response.data['error'];

      return new ErrorResponse(errorData.code, errorData.message)
      }
      
    }

    throw err;
  }
 }

export {VendorsClient};
