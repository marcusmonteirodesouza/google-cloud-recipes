import axios, {isAxiosError} from 'axios';
import {Invoice, InvoiceStatus} from './models';
import {ErrorResponse} from '../errors';
import {IDate} from '../interfaces';

interface InvoicesClientOptions {
  baseUrl: string;
}

interface ListInvoicesOptions {
  statuses?: InvoiceStatus[];
  orderBy?: OrderByClause[];
}

interface OrderByClause {
  field: 'dueDate';
  direction: 'asc' | 'desc';
}

interface UpdateInvoiceOptions {
  status?: InvoiceStatus;
  vendorAddress?: string;
  date?: IDate;
  dueDate?: IDate;
  netAmount?: number;
  totalTaxAmount?: number;
  totalAmount?: number;
  currency?: string;
}

class InvoicesClient {
  constructor(private readonly options: InvoicesClientOptions) {}

  async getInvoiceById(invoiceId: string): Promise<Invoice> {
    try {
      const {data: invoice} = await axios.get(
        `${this.options.baseUrl}/${invoiceId}`
      );

      return this.transformInvoiceResponse(invoice);
    } catch (err) {
      throw this.tryMakeErrorResponse(err);
    }
  }

  async listInvoices(options?: ListInvoicesOptions): Promise<Invoice[]> {
    try {
      const params: {statuses?: string[]; orderBy?: string[]} = {};

      if (options?.statuses) {
        params.statuses = options.statuses;
      }

      if (options?.orderBy) {
        params.orderBy = options.orderBy.map(
          this.orderByClauseToQueryParamClause
        );
      }

      const {data: invoices} = await axios.get(this.options.baseUrl, {
        params,
      });

      return invoices.map(this.transformInvoiceResponse);
    } catch (err) {
      throw this.tryMakeErrorResponse(err);
    }
  }

  async listCurrencies(): Promise<string[]> {
    try {
      const {data: currencies} = await axios.get(
        `${this.options.baseUrl}/currencies`
      );

      return currencies;
    } catch (err) {
      throw this.tryMakeErrorResponse(err);
    }
  }

  async updateInvoice(
    invoiceId: string,
    options: UpdateInvoiceOptions
  ): Promise<Invoice> {
    try {
      const {data: invoice} = await axios.patch(
        `${this.options.baseUrl}/${invoiceId}`,
        options
      );

      return this.transformInvoiceResponse(invoice);
    } catch (err) {
      throw this.tryMakeErrorResponse(err);
    }
  }

  private orderByClauseToQueryParamClause(
    orderByClause: OrderByClause
  ): string {
    return `${orderByClause.field} ${orderByClause.direction}`;
  }

  private transformInvoiceResponse(invoice: Invoice): Invoice {
    return {
      ...invoice,
      createdAt: new Date(invoice.createdAt),
      updatedAt: new Date(invoice.updatedAt),
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

export {InvoicesClient};
