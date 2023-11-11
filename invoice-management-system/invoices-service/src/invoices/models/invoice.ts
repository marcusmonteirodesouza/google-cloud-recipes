import {InvoiceStatus} from './invoice-status';

interface Invoice {
  readonly id: string;
  readonly vendorId: string;
  readonly status: InvoiceStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export {Invoice};
