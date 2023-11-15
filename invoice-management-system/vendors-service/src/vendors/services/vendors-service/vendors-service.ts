import {Knex} from 'knex';
import {DatabaseError} from 'pg';
import {Joi} from 'celebrate';
import {Vendor} from '../../models';
import {AlreadyExistsError} from '../../../errors';

interface VendorsServiceOptions {
  db: Knex;
}

interface CreateVendorOptions {
  name: string;
  email: string;
}

interface ListVendorsOptions {
  name?: string;
  email?: string;
  orderBy?: {
    field: 'name';
    direction: 'asc' | 'desc';
  }[];
}

class VendorsService {
  private readonly vendorsTable = 'vendors';

  constructor(private readonly options: VendorsServiceOptions) {}

  async createVendor(options: CreateVendorOptions): Promise<Vendor> {
    if (!this.isValidEmail(options.email)) {
      throw new RangeError(`Invalid email ${options.email}`);
    }

    try {
      const [vendor] = await this.options
        .db<Vendor>(this.vendorsTable)
        .insert({
          name: options.name,
          email: options.email,
        })
        .returning('*');

      return vendor;
    } catch (err) {
      if (err instanceof DatabaseError) {
        if (err.code === '23505') {
          if (err.constraint === 'vendors_name_unique') {
            throw new AlreadyExistsError('Vendor already exists');
          }

          if (err.constraint === 'vendors_email_unique') {
            throw new AlreadyExistsError('Email already exists');
          }
        }
      }

      throw err;
    }
  }

  async getVendorById(vendorId: string): Promise<Vendor | undefined> {
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

        if (options?.email) {
          queryBuilder.where({email: options.email});
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

  private async isValidEmail(email: string) {
    try {
      await Joi.string().email().validateAsync(email);
      return true;
    } catch (err) {
      return false;
    }
  }
}

export {VendorsService};
