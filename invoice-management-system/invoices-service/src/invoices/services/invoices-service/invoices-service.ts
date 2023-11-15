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

  async createInvoice(vendorId: string): Promise<Invoice> {
    const vendor = await this.options.vendors.client.getVendorById(vendorId);

    if (!vendor) {
      throw new NotFoundError(`Vendor ${vendorId} not found`);
    }

    const [invoice] = await this.options
      .db<Invoice>(this.invoicesTable)
      .insert({vendorId: vendor.id, status: InvoiceStatus.Created})
      .returning('*');

    return invoice;
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice | undefined> {
    const [invoice] = await this.options
      .db<Invoice>(this.invoicesTable)
      .where({id: invoiceId});

    return invoice;
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

  async uploadInvoiceDocument(
    invoiceId: string,
    options: UploadInvoiceDocumentOptions
  ): Promise<Invoice> {
    const validMimeTypes = ['application/pdf'];

    if (!validMimeTypes.includes(options.document.mimeType)) {
      throw new RangeError(
        `Invalid mimeType ${options.document.mimeType}. Expected one of ${validMimeTypes}`
      );
    }

    const invoice = await this.getInvoiceById(invoiceId);

    if (!invoice) {
      throw new NotFoundError(`Invoice ${invoiceId} not found`);
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

    const updatedInvoice = await this.options.db.transaction(async trx => {
      const [invoice] = await trx<Invoice>(this.invoicesTable)
        .where({id: invoiceId})
        .modify(queryBuilder => {
          if (invoiceDate) {
            queryBuilder.update({date: invoiceDate});
          }

          if (invoiceDueDate) {
            queryBuilder.update({dueDate: invoiceDueDate});
          }

          if (netAmount) {
            queryBuilder.update({netAmount: Number.parseFloat(netAmount)});
          }

          if (totalTaxAmount) {
            queryBuilder.update({
              totalTaxAmount: Number.parseFloat(totalTaxAmount),
            });
          }

          if (totalAmount) {
            queryBuilder.update({totalAmount: Number.parseFloat(totalAmount)});
          }

          if (currency) {
            queryBuilder.update({currency});
          }

          if (vendorAddress && vendorGooglePlaceId) {
            queryBuilder.update({vendorAddress, vendorGooglePlaceId});
          }

          if (
            invoiceDate ||
            invoiceDueDate ||
            netAmount ||
            totalTaxAmount ||
            totalAmount ||
            currency ||
            (vendorAddress && vendorGooglePlaceId)
          ) {
            queryBuilder.update({updatedAt: new Date()});
          }
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

    return updatedInvoice;
  }
}

export {InvoicesService};
