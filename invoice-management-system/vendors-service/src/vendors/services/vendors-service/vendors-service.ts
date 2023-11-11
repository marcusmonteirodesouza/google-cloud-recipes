import {Knex} from 'knex';
import {DatabaseError} from 'pg';
import {AddressValidationClient} from '@googlemaps/addressvalidation';
import {Vendor} from '../../models';
import {AlreadyExistsError} from '../../../errors';

interface VendorsServiceOptions {
  db: Knex;
  google: {
    addressValidation: {
      client: AddressValidationClient;
    };
  };
}

interface ListVendorsOptions {
  name?: string;
  orderBy?: {
    field: 'name';
    direction: 'asc' | 'desc';
  }[];
}

class VendorsService {
  private readonly vendorsTable = 'vendors';

  constructor(private readonly options: VendorsServiceOptions) {}

  async createVendor(name: string, address: string): Promise<Vendor> {
    const [validateAddressResponse] =
      await this.options.google.addressValidation.client.validateAddress({
        address: {
          addressLines: [address],
        },
      });

    if (!validateAddressResponse.result?.geocode?.placeId) {
      throw new RangeError('Invalid address');
    }

    try {
      const [vendor] = await this.options
        .db<Vendor>(this.vendorsTable)
        .insert({
          name,
          address,
          googlePlaceId: validateAddressResponse.result.geocode.placeId,
        })
        .returning('*');

      return vendor;
    } catch (err) {
      if (err instanceof DatabaseError) {
        if (err.code === '23505') {
          if (err.constraint === 'vendors_name_unique') {
            throw new AlreadyExistsError('Vendor already exists');
          }
        }
      }

      throw err;
    }
  }

  async getVendorById(vendorId: string): Promise<Vendor> {
    const [vendor] = await this.options
      .db<Vendor>(this.vendorsTable)
      .where({id: vendorId});

    return vendor;
  }

  async listVendors(options?: ListVendorsOptions): Promise<Vendor[]> {
    return await this.options
      .db<Vendor>(this.vendorsTable)
      .modify(queryBuilder => {
        if (options?.name) {
          queryBuilder.where({name: options.name});
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

  async deleteVendorById(vendorId: string): Promise<void> {
    await this.options.db(this.vendorsTable).where('id', vendorId).del();
  }
}

export {VendorsService};
