import {Knex} from 'knex';
import {DocumentProcessorServiceClient} from '@google-cloud/documentai';
import {Storage} from '@google-cloud/storage';
import {AddressValidationClient} from '@googlemaps/addressvalidation';
import mimeTypes from 'mime-types';
import * as currencies from '@dinero.js/currencies';
import {VendorsClient} from '../../../common/clients/vendors';
import {IDate} from '../../../common/interfaces';
import {Invoice, InvoiceDocument, InvoiceStatus} from '../../models';
import {AlreadyExistsError, NotFoundError} from '../../../errors';
import {DatabaseError} from 'pg';

interface InvoicesServiceOptions {
  db: Knex;
  google: {
    addressValidation: {
      client: AddressValidationClient;
    };
    documentAi: {
      documentProcessorServiceClient: DocumentProcessorServiceClient;
      processors: {
        invoiceParser: {
          id: string;
        };
      };
    };
    storage: {
      client: Storage;
      buckets: {
        invoices: {
          documents: string;
        };
      };
    };
  };
  vendors: {
    client: VendorsClient;
  };
}

interface ListInvoicesOptions {
  ids?: string[];
  statuses?: InvoiceStatus[];
  vendorIds?: string[];
  orderBy?: {
    field: 'dueDate';
    direction: 'asc' | 'desc';
  }[];
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

interface InvoiceDocumentFile {
  content: Buffer;
  mimeType: string;
}

interface CreateInvoiceOptions {
  document: InvoiceDocumentFile;
}

interface InvoiceRow extends Omit<Invoice, 'date' | 'dueDate'> {
  date?: Date;
  dueDate?: Date;
}

class InvoicesService {
  private readonly invoicesTable = 'invoices';
  private readonly invoiceDocumentsTable = 'invoice_documents';

  constructor(private readonly options: InvoicesServiceOptions) {}

  async createInvoice(options: CreateInvoiceOptions): Promise<Invoice> {
    const validMimeTypes = ['application/pdf'];

    if (!validMimeTypes.includes(options.document.mimeType)) {
      throw new RangeError(
        `Invalid mimeType ${options.document.mimeType}. Expected one of ${validMimeTypes}`
      );
    }

    const [invoiceParserProcessDocumentResponse] =
      await this.options.google.documentAi.documentProcessorServiceClient.processDocument(
        {
          name: this.options.google.documentAi.processors.invoiceParser.id,
          rawDocument: {
            content: options.document.content.toString('base64'),
            mimeType: options.document.mimeType,
          },
        }
      );

    const vendorInvoiceId =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'invoice_id'
      )?.mentionText;

    if (!vendorInvoiceId) {
      throw new RangeError('Invoice ID not found in invoice document');
    }

    const vendorName =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'supplier_name'
      )?.mentionText;

    if (!vendorName) {
      throw new RangeError(
        `Vendor name not found in invoice ${vendorInvoiceId}`
      );
    }

    const vendors = await this.options.vendors.client.listVendors({
      names: [vendorName],
    });

    if (vendors.length === 0) {
      throw new NotFoundError(`Vendor ${vendorName} not found`);
    }

    if (vendors.length > 1) {
      throw new Error(`More than one vendor with name ${vendorName} was found`);
    }

    const vendor = vendors[0];

    const vendorAddress =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'supplier_address'
      )?.mentionText;

    let vendorGooglePlaceId: string | null | undefined;

    if (vendorAddress) {
      vendorGooglePlaceId = await this.getGooglePlaceId(vendorAddress);
    }

    const invoiceDateValue =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'invoice_date'
      )?.normalizedValue?.dateValue;

    let invoiceDate: Date | undefined;

    if (
      invoiceDateValue &&
      invoiceDateValue.year &&
      invoiceDateValue.month &&
      invoiceDateValue.day
    ) {
      invoiceDate = new Date(
        `${invoiceDateValue.year}-${invoiceDateValue.month}-${invoiceDateValue.day}`
      );
    }

    const invoiceDueDateValue =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'due_date'
      )?.normalizedValue?.dateValue;

    let invoiceDueDate: Date | undefined;

    if (
      invoiceDueDateValue &&
      invoiceDueDateValue.year &&
      invoiceDueDateValue.month &&
      invoiceDueDateValue.day
    ) {
      invoiceDueDate = new Date(
        `${invoiceDueDateValue.year}-${invoiceDueDateValue.month}-${invoiceDueDateValue.day}`
      );
    }

    const netAmount =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'net_amount'
      )?.normalizedValue?.text;

    const totalTaxAmount =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'total_tax_amount'
      )?.normalizedValue?.text;

    const totalAmount =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'total_amount'
      )?.normalizedValue?.text;

    const currency =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'currency'
      )?.normalizedValue?.text;

    if (currency) {
      if (!this.isValidCurrency(currency)) {
        throw new RangeError(`Invalid currency ${currency}`);
      }
    }

    const invoiceRow = await this.options.db.transaction(async trx => {
      let invoiceRow: InvoiceRow;

      try {
        [invoiceRow] = await this.options
          .db<InvoiceRow>(this.invoicesTable)
          .insert({
            status: InvoiceStatus.Created,
            vendorId: vendor.id,
            vendorInvoiceId,
            vendorAddress,
            vendorGooglePlaceId,
            date: invoiceDate,
            dueDate: invoiceDueDate,
            netAmount: netAmount ? Number.parseFloat(netAmount) : null,
            totalTaxAmount: totalTaxAmount
              ? Number.parseFloat(totalTaxAmount)
              : null,
            totalAmount: totalAmount ? Number.parseFloat(totalAmount) : null,
            currency,
          })
          .returning('*');
      } catch (err) {
        if (err instanceof DatabaseError) {
          if (err.code === '23505') {
            if (
              err.constraint === 'invoices_vendor_id_vendor_invoice_id_unique'
            ) {
              throw new AlreadyExistsError(
                `Invoice ID ${vendorInvoiceId} already exists for Vendor ${vendor.name}`
              );
            }
          }
        }

        throw err;
      }

      const gcsFileExtension = mimeTypes.extension(options.document.mimeType);

      if (!gcsFileExtension) {
        throw new RangeError(
          `Invalid document mimeType ${options.document.mimeType}`
        );
      }

      const gcsBucket = this.options.google.storage.client.bucket(
        this.options.google.storage.buckets.invoices.documents
      );

      const gcsFile = gcsBucket.file(`${invoiceRow.id}.${gcsFileExtension}`);

      await trx<InvoiceDocument>(this.invoiceDocumentsTable).insert({
        invoiceId: invoiceRow.id,
        gcsBucket: gcsBucket.name,
        gcsFile: gcsFile.name,
      });

      await gcsFile.save(options.document.content, {
        metadata: {
          contentType: options.document.mimeType,
        },
      });

      return invoiceRow;
    });

    return this.invoiceRowToInvoice(invoiceRow);
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
    const [invoice] = await this.options
      .db<InvoiceRow>(this.invoicesTable)
      .where({id: invoiceId});

    if (!invoice) {
      return;
    }

    return this.invoiceRowToInvoice(invoice);
  }

  async listInvoices(options?: ListInvoicesOptions): Promise<Invoice[]> {
    const invoiceRows = await this.options
      .db<InvoiceRow>(this.invoicesTable)
      .modify(queryBuilder => {
        if (options?.ids) {
          queryBuilder.whereIn('id', options.ids);
        }

        if (options?.statuses) {
          queryBuilder.whereIn('status', options.statuses);
        }

        if (options?.vendorIds) {
          queryBuilder.whereIn('vendorId', options.vendorIds);
        }

        if (options?.orderBy) {
          queryBuilder.orderBy(
            options.orderBy.map(ordering => {
              return {
                column: ordering.field,
                order: ordering.direction,
              };
            })
          );
        }
      });

    return invoiceRows.map(this.invoiceRowToInvoice);
  }

  listCurrencies(): string[] {
    return Object.values(currencies).map(currency => currency.code);
  }

  async downloadInvoiceDocumentFile(
    invoiceId: string
  ): Promise<InvoiceDocumentFile | undefined> {
    const [invoiceDocument] = await this.options
      .db<InvoiceDocument>(this.invoiceDocumentsTable)
      .where({invoiceId});

    if (!invoiceDocument) {
      return;
    }

    const invoiceDocumentGcsFile = this.options.google.storage.client
      .bucket(invoiceDocument.gcsBucket)
      .file(invoiceDocument.gcsFile);

    if (!(await invoiceDocumentGcsFile.exists())) {
      throw new Error(
        `Google Storage file for invoice ${invoiceId} does not exist in bucket ${invoiceDocumentGcsFile.bucket.name}, file name ${invoiceDocumentGcsFile.name}`
      );
    }

    const [invoiceDocumentFile] = await invoiceDocumentGcsFile.get();

    if (!invoiceDocumentFile.metadata.contentType) {
      throw new Error(
        `Content Type is not set for file ${invoiceDocumentGcsFile.name} in bucket ${invoiceDocumentGcsFile.bucket.name}, invoice ${invoiceId}`
      );
    }

    const [invoiceDocumentContent] = await invoiceDocumentGcsFile.download();

    return {
      content: invoiceDocumentContent,
      mimeType: invoiceDocumentFile.metadata.contentType,
    };
  }

  async updateInvoice(
    invoiceId: string,
    options: UpdateInvoiceOptions
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(invoiceId);

    if (!invoice) {
      throw new NotFoundError(`Invoice ${invoiceId} not found`);
    }

    const [updatedInvoiceRow] = await this.options
      .db<InvoiceRow>(this.invoicesTable)
      .where({id: invoice.id})
      .modify(async queryBuilder => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};

        if (options.status) {
          updateData.status = options.status;
        }

        if (options.vendorAddress) {
          const vendorGooglePlaceId = await this.getGooglePlaceId(
            options.vendorAddress
          );

          updateData.vendorAddress = options.vendorAddress;
          updateData.vendorGooglePlaceId = vendorGooglePlaceId;
        }

        if (options.date) {
          updateData.date = new Date(
            options.date.year,
            options.date.month - 1,
            options.date.day
          );
        }

        if (options.dueDate) {
          updateData.dueDate = new Date(
            options.dueDate.year,
            options.dueDate.month - 1,
            options.dueDate.day
          );
        }

        if (options.netAmount) {
          updateData.netAmount = options.netAmount;
        }

        if (options.totalTaxAmount) {
          updateData.totalTaxAmount = options.totalTaxAmount;
        }

        if (options.totalAmount) {
          updateData.totalAmount = options.totalAmount;
        }

        if (options.currency) {
          if (!this.isValidCurrency(options.currency)) {
            throw new RangeError(`Invalid currency ${options.currency}`);
          }

          updateData.currency = options.currency;
        }

        if (Object.keys(updateData).length > 0) {
          await queryBuilder.update({...updateData, updatedAt: new Date()});
        }
      })
      .returning('*');

    return this.invoiceRowToInvoice(updatedInvoiceRow);
  }

  private isValidCurrency(currency: string): boolean {
    return this.listCurrencies().includes(currency);
  }

  private async getGooglePlaceId(address: string): Promise<string> {
    const [validateAddressResponse] =
      await this.options.google.addressValidation.client.validateAddress({
        address: {
          addressLines: [address],
        },
      });

    if (!validateAddressResponse.result?.geocode?.placeId) {
      throw new RangeError(`Invalid address ${address}`);
    }

    return validateAddressResponse.result?.geocode?.placeId;
  }

  private invoiceRowToInvoice(invoiceRow: InvoiceRow): Invoice {
    return {
      ...invoiceRow,
      date: invoiceRow.date && {
        year: invoiceRow.date.getFullYear(),
        month: invoiceRow.date.getMonth() + 1,
        day: invoiceRow.date.getDate(),
      },
      dueDate: invoiceRow.dueDate && {
        year: invoiceRow.dueDate.getFullYear(),
        month: invoiceRow.dueDate.getMonth() + 1,
        day: invoiceRow.dueDate.getDate(),
      },
    };
  }
}

export {InvoicesService};
