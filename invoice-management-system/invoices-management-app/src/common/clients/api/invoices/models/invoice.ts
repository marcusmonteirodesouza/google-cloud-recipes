import {InvoiceStatus} from './invoice-status';

interface Invoice {
  readonly id: string;
  readonly status: InvoiceStatus;
  readonly vendorId: string;
  readonly vendorInvoiceId: string;
  readonly vendorAddress: string | null | undefined;
  readonly vendorGooglePlaceId: string | null | undefined;
  readonly date: Date | null | undefined;
  readonly dueDate: Date | null | undefined;
  readonly netAmount: number | null | undefined;
  readonly totalTaxAmount: number | null | undefined;
  readonly totalAmount: number | null | undefined;
  readonly currency: string | null | undefined;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export {Invoice};