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

    const vendorAddress =
      invoiceParserProcessDocumentResponse.document?.entities?.find(
        entity => entity.type === 'supplier_address'
      )?.mentionText;

    if (!vendorName) {
      throw new RangeError('Vendor name not found in invoice file');
    }

    if (!vendorAddress) {
      throw new RangeError('Vendor address not found in invoice file');
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
