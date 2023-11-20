import axios, {isAxiosError} from 'axios';
import {Invoice, InvoiceStatus} from './models';
import {ErrorResponse} from '../errors';

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

class InvoicesClient {
  constructor(private readonly options: InvoicesClientOptions) {}

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

  private orderByClauseToQueryParamClause(
    orderByClause: OrderByClause
  ): string {
    return `${orderByClause.field} ${orderByClause.direction}`;
  }

  private transformInvoiceResponse(invoice: Invoice): Invoice {
    return {
      ...invoice,
      date: invoice.date ? new Date(invoice.date) : invoice.date,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate) : invoice.dueDate,
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
