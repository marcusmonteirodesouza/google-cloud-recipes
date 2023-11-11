interface InvoiceDocument {
  readonly id: string;
  readonly invoiceId: string;
  readonly gcsBucket: string;
  readonly gcsFile: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export {InvoiceDocument};
