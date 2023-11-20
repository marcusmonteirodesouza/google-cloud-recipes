import axios from 'axios';
import {Invoice} from './models';

interface InvoicesClientOptions {
  baseUrl: string;
}

interface ListInvoicesOptions {
  orderBy?: OrderByClause[];
}

interface OrderByClause {
  field: 'name' | 'dueDate';
  direction: 'asc' | 'desc';
}

class InvoicesClient {
  constructor(private readonly options: InvoicesClientOptions) {}

  async listInvoices(options?: ListInvoicesOptions): Promise<Invoice[]> {
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

  private orderByClauseToQueryParamClause(
    orderByClause: OrderByClause
  ): string {
    return `${orderByClause.field} ${orderByClause.direction}`;
  }
}

export {InvoicesClient};
