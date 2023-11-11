import {Knex} from 'knex';
import {DocumentProcessorServiceClient} from '@google-cloud/documentai';
import {Storage} from '@google-cloud/storage';
import {AddressValidationClient} from '@googlemaps/addressvalidation';
import mimeTypes from 'mime-types';
import {VendorsClient} from '../../../common/clients/vendors';
import {Invoice, InvoiceDocument} from '../../models';
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

class InvoicesService {
  private readonly invoicesTable = 'invoices';
  private readonly invoiceDocumentsTable = 'invoice_documents';

  constructor(private readonly options: InvoicesServiceOptions) {}

  async createInvoice(data: Buffer, mimeType: string): Promise<Invoice> {
    const [invoiceParserProcessDocumentResponse] =
      await this.options.google.documentAi.documentProcessorServiceClient.processDocument(
        {
          name: this.options.google.documentAi.processors.invoiceParser.id,
          rawDocument: {
            content: data.toString('base64'),
            mimeType,
          },
        }
      );

    const vendorName =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'supplier_name'
      )?.mentionText;

    if (!vendorName) {
      throw new RangeError('Vendor name not found in invoice file');
    }

    const vendorAddress =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'supplier_address'
      )?.mentionText;

    if (!vendorAddress) {
      throw new RangeError('Vendor address not found in invoice file');
    }

    const invoiceDateValue =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'invoice_date'
      )?.normalizedValue?.dateValue;

    if (!invoiceDateValue) {
      throw new RangeError('Invoice date not found in invoice file');
    }

    if (
      !(invoiceDateValue.year && invoiceDateValue.month && invoiceDateValue.day)
    ) {
      throw new RangeError(
        `Invalid invoice date ${invoiceDateValue} in invoice file`
      );
    }

    const invoiceDate = new Date(
      invoiceDateValue.year,
      invoiceDateValue.month,
      invoiceDateValue.day
    );

    const invoiceDueDateValue =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'due_date'
      )?.normalizedValue?.dateValue;

    if (!invoiceDueDateValue) {
      throw new RangeError('Invoice due date not found in invoice file');
    }

    if (
      !(
        invoiceDueDateValue.year &&
        invoiceDueDateValue.month &&
        invoiceDueDateValue.day
      )
    ) {
      throw new RangeError(
        `Invalid invoice due date ${invoiceDueDateValue} in invoice file`
      );
    }

    const invoiceDueDate = new Date(
      invoiceDueDateValue.year,
      invoiceDueDateValue.month,
      invoiceDueDateValue.day
    );

    const netAmount =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'net_amount'
      )?.normalizedValue?.text;

    if (!netAmount) {
      throw new RangeError('Net amount not found in invoice file');
    }

    const totalTaxAmount =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'total_tax_amount'
      )?.normalizedValue?.text;

    if (!totalTaxAmount) {
      throw new RangeError('Total tax amount not found in invoice file');
    }

    const totalAmount =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'total_amount'
      )?.normalizedValue?.text;

    if (!totalAmount) {
      throw new RangeError('Total amount not found in invoice file');
    }

    const currency =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'currency'
      )?.normalizedValue?.text;

    if (!currency) {
      throw new RangeError('Currency not found in invoice file');
    }

    const [validateAddressResponse] =
      await this.options.google.addressValidation.client.validateAddress({
        address: {
          addressLines: [vendorAddress],
        },
      });

    const vendorAddressGooglePlaceId =
      validateAddressResponse.result?.geocode?.placeId;

    if (!vendorAddressGooglePlaceId) {
      throw new RangeError(`Invalid vendor address ${vendorAddress}`);
    }

    const vendors = await this.options.vendors.client.listVendors({
      name: vendorName,
    });

    const vendor = vendors.find(
      vendor => vendor.googlePlaceId === vendorAddressGooglePlaceId
    );

    if (!vendor) {
      throw new NotFoundError(
        `Vendor ${vendorName} with address ${vendorAddress} not found`
      );
    }

    const invoice = await this.options.db.transaction(async trx => {
      const [invoice] = await trx<Invoice>(this.invoicesTable)
        .insert({
          vendorId: vendor.id,
          date: invoiceDate,
          dueDate: invoiceDueDate,
          netAmount: Number.parseFloat(netAmount),
          totalTaxAmount: Number.parseFloat(totalTaxAmount),
          totalAmount: Number.parseFloat(totalAmount),
          currency,
        })
        .returning('*');

      const gcsFileExtension = mimeTypes.extension(mimeType);

      if (!gcsFileExtension) {
        throw new RangeError(`Invalid document mimeType ${mimeType}`);
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

      await gcsFile.save(data);

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
}

export {InvoicesService};
