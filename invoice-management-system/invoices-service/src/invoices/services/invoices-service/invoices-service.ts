import {Knex} from 'knex';
import {DocumentProcessorServiceClient} from '@google-cloud/documentai';
import {Storage} from '@google-cloud/storage';
import {AddressValidationClient} from '@googlemaps/addressvalidation';
import mimeTypes from 'mime-types';
import {VendorsClient} from '../../../common/clients/vendors';
import {Invoice, InvoiceDocument, InvoiceStatus} from '../../models';
import {NotFoundError} from '../../../errors';

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
  status?: InvoiceStatus;
  vendorId?: string;
  orderBy?: {
    field: 'dueDate';
    direction: 'asc' | 'desc';
  }[];
}

interface UpdateInvoiceOptions {
  status?: InvoiceStatus;
}

interface UploadInvoiceDocumentOptions {
  document: {
    content: Buffer;
    mimeType: string;
  };
}

class InvoicesService {
  private readonly invoicesTable = 'invoices';
  private readonly invoiceDocumentsTable = 'invoice_documents';

  constructor(private readonly options: InvoicesServiceOptions) {}

  async createInvoice(options: UploadInvoiceDocumentOptions): Promise<Invoice> {
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
      name: vendorName,
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
      const [validateAddressResponse] =
        await this.options.google.addressValidation.client.validateAddress({
          address: {
            addressLines: [vendorAddress],
          },
        });

      vendorGooglePlaceId = validateAddressResponse.result?.geocode?.placeId;
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
        invoiceDateValue.year,
        invoiceDateValue.month,
        invoiceDateValue.day
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
        invoiceDueDateValue.year,
        invoiceDueDateValue.month,
        invoiceDueDateValue.day
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

    const invoice = await this.options.db.transaction(async trx => {
      const [invoice] = await this.options
        .db<Invoice>(this.invoicesTable)
        .insert({
          status: InvoiceStatus.InReview,
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

      const gcsFileExtension = mimeTypes.extension(options.document.mimeType);

      if (!gcsFileExtension) {
        throw new RangeError(
          `Invalid document mimeType ${options.document.mimeType}`
        );
      }

      const gcsBucket = this.options.google.storage.client.bucket(
        this.options.google.storage.buckets.invoices.documents
      );

      const gcsFile = gcsBucket.file(`${invoice.id}.${gcsFileExtension}`);

      await trx<InvoiceDocument>(this.invoiceDocumentsTable).insert({
        invoiceId: invoice.id,
        gcsBucket: gcsBucket.name,
        gcsFile: gcsFile.name,
      });

      await gcsFile.save(options.document.content, {
        metadata: {
          contentType: options.document.mimeType,
        },
      });

      return invoice;
    });

    return invoice;
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
    const [invoice] = await this.options
      .db<Invoice>(this.invoicesTable)
      .where({id: invoiceId});

    return invoice;
  }

  async listInvoices(options: ListInvoicesOptions): Promise<Invoice[]> {
    return await this.options
      .db<Invoice>(this.invoicesTable)
      .modify(queryBuilder => {
        if (options?.status) {
          queryBuilder.where({status: options.status});
        }

        if (options?.vendorId) {
          queryBuilder.where({vendorId: options.vendorId});
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
  }

  async updateInvoice(
    invoiceId: string,
    options: UpdateInvoiceOptions
  ): Promise<Invoice> {
    const invoice = await this.getInvoiceById(invoiceId);

    if (!invoice) {
      throw new NotFoundError(`Invoice ${invoiceId} not found`);
    }

    const [updatedInvoice] = await this.options
      .db<Invoice>(this.invoicesTable)
      .where({id: invoice.id})
      .modify(queryBuilder => {
        if (options.status) {
          queryBuilder.update({status: options.status});
        }

        if (options.status) {
          queryBuilder.update({updatedAt: new Date()});
        }
      })
      .returning('*');

    return updatedInvoice;
  }
}

export {InvoicesService};
