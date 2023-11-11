import {InvoiceStatus} from './invoice-status';

interface Invoice {
  readonly id: string;
  readonly vendorId: string;
  readonly status: InvoiceStatus;
  readonly date: Date;
  readonly dueDate: Date;
  readonly netAmount: number;
  readonly totalTaxAmount: number;
  readonly totalAmount: number;
  readonly currency: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export {Invoice};
